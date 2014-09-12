// note: make sure hostname available to all connecting clients
// (ie. probably not `localhost`)
rtc.connect('ws://104.131.51.239:8001');

rtc.createStream({"video": true, "audio": true}, function(stream){
  // get local stream for manipulation
  rtc.attachStream(stream, 'local');
});

rtc.on('add remote stream', function(stream){
  // show the remote video
  rtc.attachStream(stream, 'remote');
});

// more rtc callbacks are available
document.onload = function() {
  document.getElementById("local").volume = 0;
}