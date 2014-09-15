jwplayer("RTMPPlayer").setup({
    playlist: [{
        sources: [{ 
            file: "rtmp://104.131.51.239/live/test"
        }]
    }],
    height: 360,
    primary: "flash",
    width: 640
});