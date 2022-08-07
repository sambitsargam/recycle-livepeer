const video = document.getElementById("player");
var url;
window.onload = function(){
	url = sessionStorage.getItem("streamUrl");
//	player.setAttribute("src",url);

if(Hls.isSupported())
    {
     //   var video = document.getElementById('video');
        var hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED,function()
        {
            video.play();
        });
    }
    else if (video.canPlayType('application/vnd.apple.mpegurl'))
    {
        video.src =url;
        video.addEventListener('canplay',function()
        {
            video.play();
        });
    }

}
