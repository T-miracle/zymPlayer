/* https://github.com/T-miracle/zymPlayer */
const $ = document.querySelector.bind(document),
	$$ = document.querySelectorAll.bind(document),
	$id = document.getElementById.bind(document),
	$class = document.getElementsByClassName.bind(document);

var playerWidth,
	playerElement,
	playerPosition,
	playerTop,
	playerBottom,
	playerLeft,
	playerRight,
	listHeight,
	listExpand,
	listPath,
	mode,
	playerShow,
	hideBtnState = true;

class zymAplayer {
	constructor(obj) {
		playerElement = obj['element'] || 'body';
		playerWidth = obj['width'] || '300px';
		mode = obj['mode'] || 'order'; // all cover none;
		playerShow = obj['show'] || 'all'; // all cover none
		let list = obj['list'];
		listPath = list['path'];
		listHeight = list['height'] || 320;
		listExpand = list['expand'] || false;
		let position = obj['position'];
		playerPosition = position['pos'];
		playerTop = position['top'];
		playerBottom = position['bottom'];
		playerLeft = position['left'];
		playerRight = position['right'];
		init();
	}
}

// 加载播放器
function init() {
	// 创建一个播放器盒子
	let playerBox = document.createElement('div');
	playerBox.setAttribute('id', 'amplitude-player');
	playerBox.setAttribute('class', 'amplitude-player-component');
	// 播放器添加元素
	playerBox.innerHTML = `
		<div class="player-box">
			<div class="player-container">
				<div class="left-container"><img data-amplitude-song-info="cover_art_url" class="album-art"/></div>
				<div class="right-container">
		   		<div class="song-name-box"><span data-amplitude-song-info="name" class="song-name"/></div>
					<div id="central-control-container">
						<div class="amplitude-prev" id="previous"></div>
						<div class="amplitude-play-pause"></div>
						<div class="amplitude-next" id="next"></div>
						<div id="volume-container">
							<div class="volume-controls">
								<div class="amplitude-mute amplitude-not-muted"></div>
								<input type="range" class="amplitude-volume-slider"/>
								<div class="ms-range-fix"></div>
							</div>
						</div>
						<div class="amplitude-toggle amplitude-repeat"></div>
						<div class="amplitude-toggle amplitude-repeat-song"></div>
						<div class="amplitude-toggle amplitude-shuffle"></div>
						<div id="amplitude-menu"></div>
					</div>
		   		<div id="progress-container">
		 				<input type="range" class="amplitude-song-slider"/>
		    			<progress id="song-played-progress" class="amplitude-song-played-progress"></progress>
						<progress id="song-buffered-progress" class="amplitude-buffered-progress" value="0"></progress>
		  			</div>
				</div>
			</div>
		</div>`;
	// 将播放器盒子放在父元素里面
	$(playerElement).appendChild(playerBox);
	let tempDom = document.createElement('div');
	tempDom.style.width = playerWidth;
	$('html').appendChild(tempDom);
	let _playerWidth = tempDom.offsetWidth;
	_playerWidth = _playerWidth < 300 ? 300 : _playerWidth; // 播放器长度不能低于300
	tempDom.remove();
	// 歌曲列表
	let _songListBoxDom = document.createElement('div');
	_songListBoxDom.setAttribute('id', 'amplitude-player-song-list');
	_songListBoxDom.setAttribute('class', 'amplitude-player-component');
	let _songListDom = document.createElement('div');
	_songListDom.setAttribute('id', 'list1');
	_songListDom.setAttribute('class', 'song-list');
	_songListBoxDom.appendChild(_songListDom);
	$(playerElement).appendChild(_songListBoxDom);
	// 全屏
	$(playerElement).insertAdjacentHTML(
		'beforeend',
		`<div id="amplitude-player-full-screen" class="amplitude-player-component">
			<img data-amplitude-song-info="cover_art_url"/>
			<div class="screen-container">
				<div class="close-btn"></div>
				<div class="img-box">
					<img data-amplitude-song-info="cover_art_url" class="album-art"/>
				</div>
				<div data-amplitude-song-info="name" class="song-name2"></div>
				<div data-amplitude-song-info="artist" class="song-artist2"></div>
				<div class="central-control-container">
					<div class="amplitude-toggle amplitude-repeat"></div>
					<div class="amplitude-toggle amplitude-repeat-song"></div>
					<div class="amplitude-toggle amplitude-shuffle"></div>
					<div class="amplitude-prev" id="previous"></div>
					<div class="amplitude-play-pause"></div>
					<div class="amplitude-next" id="next"></div>
					<div class="amplitude-menu" id="menu2"></div>
				</div>
				<div id="progress-container">
					<span class="running-time"><span class="amplitude-per-minutes"></span>:<span class="amplitude-per-seconds"></span></span>
					<input type="range" class="amplitude-song-slider"/>
					<progress id="song-played-progress" class="amplitude-song-played-progress"></progress>
					<progress id="song-buffered-progress" class="amplitude-buffered-progress" value="0"></progress>
					<span class="duration-time"><span class="amplitude-duration-minutes"></span>:<span class="amplitude-duration-seconds"></span></span>
				</div>
			</div>
		</div>`
	);
	let _fullScreenSonglistDom = document.createElement('div');
	_fullScreenSonglistDom.setAttribute('id', 'list2');
	_fullScreenSonglistDom.setAttribute('class', 'song-list');
	$id('amplitude-player-full-screen').appendChild(_fullScreenSonglistDom);
	// 读取歌曲列表并初始化播放器
	var xhr = new XMLHttpRequest();
	xhr.open('GET', listPath, true); //true,false代表是否异步，一般都是true
	xhr.send();
	xhr.onreadystatechange = function () {
		let _data;
		if (xhr.readyState == 4 && xhr.status == 200) {
			//xhr.status http请求结果的状态码
			_data = JSON.parse(xhr.responseText);
			//data 代表读取到的json中的数据
			let _songlistHtml = '';
			_data.map((song, idx) => {
				// 拼接音乐列表
				_songlistHtml += `
				<div class="song amplitude-song-container amplitude-play-pause" 
					data-amplitude-song-index="${idx}" title="${song.name}&emsp;-&emsp;${song.artist}">
					<span class="song-select"></span>
					<span class="song-title">${song.name}</span>
					<span class="song-artist">&emsp;-&emsp;${song.artist}</span>
				</div>`;
			});
			Array.from($class('song-list')).forEach((el) => {
				el.insertAdjacentHTML('beforeend', _songlistHtml);
			});
		}
		// 初始化音乐播放器
		Amplitude.init({
			songs: _data, // 歌曲列表数据
			volume: 100, // 初始音量
			callbacks: {
				play: function () {},
				pause: function () {},
			},
			waveforms: {
				sample_rate: 50,
			},
		});
		Array.from($class('amplitude-toggle')).forEach((el) => {
			el.style.display = 'none';
		});
		Amplitude.setRepeat(true);
		if (mode === 'order') {
			Amplitude.setRepeat(false);
			Array.from($class('amplitude-repeat')).forEach((el) => {
				el.style.display = '';
			});
		}
		if (mode === 'list') {
			Array.from($class('amplitude-repeat')).forEach((el) => {
				el.style.display = '';
			});
		}
		if (mode === 'song') {
			Amplitude.setRepeatSong(true);
			Array.from($class('amplitude-song-repeat')).forEach((el) => {
				el.style.display = '';
			});
		}
		if (mode === 'random') {
			Amplitude.setShuffle(true);
			Array.from($class('amplitude-shuffle')).forEach((el) => {
				el.style.display = '';
			});
		}
	};
	setPlayerElementPosition(_playerWidth);
}

setInterval(() => {
	setSongTime();
}, 1000);

// 设置歌曲当前播放的时间
function setSongTime() {
	let duration = Amplitude.getSongDuration() || 0;
	let per = Amplitude.getSongPlayedPercentage() || 0;
	let minutes = Math.floor((duration * per) / 100 / 60) + '',
		seconds = Math.floor(((duration * per) / 100) % 60) + '';
	Array.from($class('amplitude-per-minutes')).forEach((element) => {
		element.innerText = minutes.length === 1 ? '0' + minutes : '' + minutes;
	});
	Array.from($class('amplitude-per-seconds')).forEach((element) => {
		element.innerText = seconds.length === 1 ? '0' + seconds : '' + seconds;
	});
}

// 根据播放器定位，设置播放器子元素的位置信息
function setPlayerElementPosition(width) {
	// 根据配置设置播放器主体定位
	if (playerPosition !== undefined) {
		$id('amplitude-player').style.position = playerPosition;
	}
	Array.from($class('hide-btn')).forEach((el) => {
		el.remove();
	});
	let _playerBoxDom = Array.from($class('player-box'))[0];
	if (playerLeft !== undefined) {
		_playerBoxDom.style.left = 0;
		_playerBoxDom.style.right = '';
		_playerBoxDom.insertAdjacentHTML('beforeend', '<div class="hide-btn"></div>');
		let _playerDom = $id('amplitude-player');
		_playerDom.style.left = playerLeft;
		_playerDom.style.right = '';
		let _leftContainerDom = Array.from($class('left-container'))[0];
		_leftContainerDom.style.float = 'right';
		let _rightContainerDom = Array.from($class('right-container'))[0];
		_rightContainerDom.style.float = 'right';
		Array.from($class('hide-btn'))[0].classList.add('turn');
	} else {
		_playerBoxDom.style.left = '';
		_playerBoxDom.style.right = 0;
		_playerBoxDom.insertAdjacentHTML('afterbegin', '<div class="hide-btn"></div>');
		Array.from($class('left-container'))[0].style.float = 'left';
		Array.from($class('right-container'))[0].style.float = 'left';
	}
	if (playerRight !== undefined) {
		let _playerDom = $id('amplitude-player');
		_playerDom.style.left = '';
		_playerDom.style.right = playerRight;
	}
	if (playerTop !== undefined) {
		let _playerDom = $id('amplitude-player');
		_playerDom.style.top = playerTop;
		_playerDom.style.bottom = '';
	}
	if (playerBottom !== undefined) {
		let _playerDom = $id('amplitude-player');
		_playerDom.style.top = '';
		_playerDom.style.bottom = playerBottom;
	}
	if (playerShow === 'all') {
		let _playerDom = $id('amplitude-player');
		_playerDom.style.width = width + 'px';
	} else {
		Array.from($class('hide-btn'))[0].classList.toggle('turn');
		listExpand = false;
		if (playerLeft !== undefined) {
			_playerBoxDom.style.left = playerShow === 'none' ? 20 - width + 'px' : 86 - width + 'px';
			_playerBoxDom.style.right = '';
		} else {
			_playerBoxDom.style.left = '';
			_playerBoxDom.style.right = playerShow === 'none' ? 20 - width + 'px' : 86 - width + 'px';
		}
		if (playerShow === 'cover') {
			$id('amplitude-player').style.width = '86px';
		} else {
			$id('amplitude-player').style.width = '20px';
		}
	}
	// 设置播放器副体长度
	_playerBoxDom.style.width = width + 'px';
	// 设置副体容器长度
	Array.from($class('player-container'))[0].style.width = width - 20 + 'px';
	// 设置播放器歌单是否默认展开
	listExpand
		? ($id('amplitude-player-song-list').style.height = listHeight + 'px')
		: ($id('amplitude-player-song-list').style.height = 0);
	// 设置播放器歌单高度
	$id('list1').style.height = listHeight + 'px';
	// 根据播放器长度设置子元素样式
	if (width < 360) {
		Array.from($class('right-container'))[0].style.flexDirection = 'column';
		Array.from($class('amplitude-volume-slider'))[0].style.display = 'none';
		Array.from($class('ms-range-fix'))[0].style.display = 'none';
	} else if (width < 720) {
		Array.from($class('right-container'))[0].style.flexDirection = 'column';
		Array.from($class('amplitude-volume-slider'))[0].style.display = '';
		Array.from($class('ms-range-fix'))[0].style.display = '';
		$id('volume-container').style.width = '30%';
	} else {
		$id('volume-container').style.width = '30%';
		Array.from($class('right-container'))[0].style.flexDirection = 'row';
	}

	clickSetElementStyle(width);
	setTimeout(() => {
		setSongListPosition(width);
	}, 800);
}

// 根据播放器定位，设置歌单在播放器上的相对位置信息
function setSongListPosition(width) {
	// 获取播放器在页面上的坐标位置
	let _bodyHeight = window.innerHeight;
	let _bodyWidth = window.innerWidth;
	let _amplitude = $id('amplitude-player');
	let _top = _amplitude.offsetTop;
	let _left = _amplitude.offsetLeft;
	let _songListDom = $id('amplitude-player-song-list');
	_songListDom.style.width = width - 20 + 'px';
	if (playerLeft) {
		_songListDom.style.left = _left + 'px';
		_songListDom.style.right = '';
	} else {
		_songListDom.style.left = _left + 20 + 'px';
		_songListDom.style.right = '';
	}
	if (_top < _bodyHeight - _top - 66) {
		_songListDom.style.top = _top + 66 + 'px';
		_songListDom.style.bottom = '';
	} else {
		_songListDom.style.top = '';
		_songListDom.style.bottom = _bodyHeight - _top + 'px';
	}
	let _imgBox = $id('amplitude-player-full-screen').getElementsByClassName('img-box')[0];
	if (_bodyWidth < _bodyHeight - 140) {
		_imgBox.style.width = _bodyWidth * 0.7 + 'px';
		_imgBox.style.height = _bodyWidth * 0.7 + 'px';
		_imgBox.style.marginBottom = _bodyWidth * 0.1 + 'px';
	} else {
		_imgBox.style.width = (_bodyHeight - 140) * 0.7 + 'px';
		_imgBox.style.height = (_bodyHeight - 140) * 0.7 + 'px';
		_imgBox.style.marginBottom = (_bodyHeight - 140) * 0.2 + 'px';
	}
}

// 播放器点击事件
function clickSetElementStyle(width) {
	// 切换播放方式
	Array.from($class('amplitude-toggle')).forEach((el) => {
		el.addEventListener('click', () => {
			let arr = ['order', 'list', 'song', 'random'];
			let idx = arr.indexOf(mode);
			mode = idx === 3 ? arr[0] : arr[idx + 1];
			Array.from($class('amplitude-toggle')).forEach((el) => {
				el.style.display = 'none';
			});
			if (mode === 'order') {
				Array.from($class('amplitude-repeat')).forEach((el) => {
					el.style.display = '';
				});
				Amplitude.setRepeat(false);
			}
			if (mode === 'list') {
				Array.from($class('amplitude-repeat')).forEach((el) => {
					el.style.display = '';
				});
			}
			if (mode === 'song') {
				Array.from($class('amplitude-repeat-song')).forEach((el) => {
					el.style.display = '';
				});
				Amplitude.setRepeatSong();
				setTimeout(() => {
					Amplitude.setRepeat(true);
				}, 800);
			}
			if (mode === 'random') {
				Array.from($class('amplitude-shuffle')).forEach((el) => {
					el.style.display = '';
				});
				Amplitude.setShuffle(true);
			}
		});
	});
	// 监听整个播放器，根据当前播放状态设置全屏中歌曲图片的转动
	Array.from($class('amplitude-player-component')).forEach((el) => {
		el.addEventListener('click', () => {
			monitorPlayerState();
		});
	});
	// 改变进度条显示当前歌曲播放的时间
	let state;
	Array.from($class('amplitude-song-slider')).forEach((el) => {
		el.addEventListener('mousedown', () => {
			state = Amplitude.getPlayerState() === 'playing';
			Amplitude.pause();
		});
		el.addEventListener('mouseup', () => {
			!state || Amplitude.play();
		});
		el.addEventListener('input propertychange', () => {
			setSongTime();
		});
	});
	// 打开全屏
	Array.from($class('left-container'))[0].addEventListener('click', () => {
		$id('amplitude-player-full-screen').style.top = 0;
	});
	// 关闭全屏
	Array.from($class('close-btn'))[0].addEventListener('click', () => {
		$id('amplitude-player-full-screen').style.top = '';
	});
	// 点击隐藏显示歌单
	$id('amplitude-menu').addEventListener('click', () => {
		let _songListDom = $id('amplitude-player-song-list');
		_songListDom.style.height = _songListDom.offsetHeight === 0 ? listHeight + 'px' : 0;
	});
	// 全局点击监听
	$id('amplitude-player-full-screen').addEventListener('click', () => {
		$id('list2').classList.remove('hide');
		monitorPlayerState();
	});
	// 点击歌名显示二级歌单
	$id('menu2').addEventListener('click', (e) => {
		$id('list2').classList.toggle('hide');
		e.stopPropagation();
	});
	// 点击隐藏按钮事
	Array.from($class('hide-btn')).forEach((el) => {
		el.addEventListener('click', () => {
			let _playerBoxDom = Array.from($class('player-box'))[0];
			let _playerDom = $id('amplitude-player');
			if (hideBtnState) {
				hideBtnState = false;
				$id('amplitude-player-song-list').style.height = 0;
				if (_playerDom.offsetWidth === width) {
					if (playerShow === 'cover') _playerDom.style.width = '86px';
					else _playerDom.style.width = '20px';
				} else {
					_playerDom.style.width = width + 'px';
				}
				$class('hide-btn')[0].classList.toggle('turn');
				if (playerLeft !== undefined) {
					if (_playerBoxDom.style.left === '0px') {
						_playerBoxDom.style.left = playerShow === 'cover' ? 86 - width + 'px' : 20 - width + 'px';
						_playerBoxDom.style.right = '';
					} else {
						_playerBoxDom.style.left = 0;
						_playerBoxDom.style.right = '';
					}
				} else {
					if (_playerBoxDom.style.right === '0px') {
						_playerBoxDom.style.left = '';
						_playerBoxDom.style.right = playerShow === 'cover' ? 86 - width + 'px' : 20 - width + 'px';
					} else {
						_playerBoxDom.style.left = '';
						_playerBoxDom.style.right = 0;
					}
				}
				// 防止双击
				setTimeout(() => {
					hideBtnState = true;
				}, 500);
			}
		});
	});
}

// 监听播放器状态，然后设置样式
function monitorPlayerState() {
	if (Amplitude.getPlayerState() === 'playing') {
		document
			.getElementById('amplitude-player-full-screen')
			.getElementsByClassName('img-box')[0]
			.classList.add('running');
	} else {
		document
			.getElementById('amplitude-player-full-screen')
			.getElementsByClassName('img-box')[0]
			.classList.remove('running');
	}
}

window.onresize = () => {
	let _bodyWidth = window.innerWidth;
	let tempDom = document.createElement('div');
	tempDom.style.width = playerWidth;
	$('html').appendChild(tempDom);
	let _playerWidth = tempDom.offsetWidth;
	if (_bodyWidth < _playerWidth) {
		setPlayerElementPosition(_bodyWidth);
	} else {
		setPlayerElementPosition(_playerWidth);
	}
	tempDom.remove();
};
