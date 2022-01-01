
<link rel="stylesheet" href="./zymPlayer.css" />
<script src="./amplitude.min.js"></script>
<script src="./zymPlayer.js"></script>
<script>
    new zymAplayer({
        width: '450px',
        mode: 'random',
        list: {
            path: '/music/musicList.json',
        },
        position: {
            left: '0px',
            bottom: '0px'
        }
    });
</script>
