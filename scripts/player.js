;(function(mouse){

	var player
		, audioContext
		, audioBufferSourceNode
		, file
		, note
		, previousValue = 0
		, spectrums = document.getElementsByClassName("spectrum")
		, status = true
		, animationId = 0
		;


	var getFileBlob = function (url, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.addEventListener('load', function() {
            cb(xhr.response);
        });
        xhr.send();
	};

	var blobToFile = function (blob, name) {
	        blob.lastModifiedDate = new Date();
	        blob.name = name;
	        return blob;
	};

	var getFileObject = function(filePathOrUrl, cb) {
	       getFileBlob(filePathOrUrl, function (blob) {
	          cb(blobToFile(blob, 'Annabelle.mp3'));
	       });
	};

	getFileObject('resource/Annabelle.mp3', function (fileObject) {
	     console.log(fileObject);
	     file = fileObject
	     load()
	}); 

	function _player_start(){

		// player.play();
		window.AudioContext = window.AudioContext || window.webkitAudioContext ||
			window.mozAudioContext || window.msAudioContext;
		try{
			audioContext = new AudioContext()
			_addPlayerListener()
		} catch (e){
			console.error("Sorry, the browser does not support AudioContext, please try it in Chrome");
		} 

	}

	function _addPlayerListener(){

		var fr = new FileReader()
		fr.onload = function(e){
			var fileResult = e.target.result
			audioContext.decodeAudioData(fileResult, function(buffer){
				_visualize(buffer)
			})
		}
		fr.readAsArrayBuffer(file)
	}

	function _visualize(buffer){
		audioBufferSourceNode = audioContext.createBufferSource()
		
		var  analyser = audioContext.createAnalyser()

		audioBufferSourceNode.connect(analyser)

		analyser.connect(audioContext.destination)

		audioBufferSourceNode.buffer = buffer
		if(!audioBufferSourceNode.start){
			audioBufferSourceNode.start = audioBufferSourceNode.noteOn

			audioBufferSourceNode.stop = audioBufferSourceNode.noteOff
		}
		audioBufferSourceNode.onended = function(){
			console.log("Ended")
			status = false
		}
		audioBufferSourceNode.start(0)

		analyserMonitor(analyser)
	}

	function analyserMonitor(analyser){
		// console.log(analyser)
		// note.innerHTML = analyser.frequencyBinCount
		var spectrums_size = spectrums.length
		var interval = Math.floor(analyser.frequencyBinCount / spectrums_size)

		var monitorAudioFrequency = function(){
			if(status === false){
				for(var i=0; i< spectrums_size; i++){
					spectrums[i].style.height = "0px"
				}

				document.getElementById("player_cover_img").style.animationPlayState = "paused"
				audioBufferSourceNode.stop()
				mouse.down = false
				cancelAnimFrame(animationId)
				// var allCapsReachBottom = true;

	   //          for (var i = capYPositionArray.length - 1; i >= 0; i--) {
	   //              allCapsReachBottom = allCapsReachBottom && (capYPositionArray[i] === 0);
	   //          };

				return;
			}
			var dataArray = new Uint8Array(analyser.frequencyBinCount)
			analyser.getByteFrequencyData(dataArray)

			var value = dataArray[20]

			if(value > previousValue){
				mouse.down = true
			}
			else if(value < previousValue-2){
				mouse.down = false
			}

			for(var i=0; i< spectrums_size; i++){
				spectrums[i].style.height = dataArray[i*interval] + "px"
			}

			previousValue = value
			animationId = requestAnimFrame(monitorAudioFrequency)
		}
		animationId = requestAnimFrame(monitorAudioFrequency)
		// debugger
	}

	function load(){
		player = document.getElementById("player");

		note = document.getElementById("note")

		var musicToggle = document.getElementById("music_toggle")

		musicToggle.addEventListener("click",function(){
			status = false
		})
		// var f = new File(blob, "../resource/music.mp3")

		// player.addEventListener("change", function(){
		// 	console.log(player.value)
		// 	console.log(player.files[0])
		// })

		// console.log(player.files[0])
		// spectrums[0].style.height =  "50px"
		// 
		_player_start();
	}

	// window.addEventListener("load", load);

})(mouse);