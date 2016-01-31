;(function(mouse){

	var player
		, audioContext
		, file
		, note
		, previousValue = 0
		, spectrums = document.getElementsByClassName("spectrum")
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
		// try{
			audioContext = new AudioContext()
			_addPlayerListener()
		// } catch (e){
			// console.error("Your browser does not support AudioContext");
		// } 

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
		var audioBufferSourceNode = audioContext.createBufferSource()
			, analyser = audioContext.createAnalyser()

		audioBufferSourceNode.connect(analyser)

		analyser.connect(audioContext.destination)

		audioBufferSourceNode.buffer = buffer
		if(!audioBufferSourceNode.start){
			audioBufferSourceNode.start = audioBufferSourceNode.noteOn

			audioBufferSourceNode.stop = audioBufferSourceNode.noteOff
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
			var array = new Uint8Array(analyser.frequencyBinCount)
			analyser.getByteFrequencyData(array)
			var value = array[20]
			note.innerHTML = value
			if(value > previousValue){
				mouse.down = true
			}
			else if(value < previousValue-2){
				mouse.down = false
			}

			for(var i=0; i< spectrums_size; i++){
				spectrums[i].style.height = array[i*interval] + "px"
			}

			previousValue = value
			requestAnimFrame(monitorAudioFrequency)
		}
		requestAnimFrame(monitorAudioFrequency)
		// debugger
	}

	function load(){
		player = document.getElementById("player");

		note = document.getElementById("note")
		// var f = new File(blob, "../resource/music.mp3")

		// player.addEventListener("change", function(){
		// 	console.log(player.value)
		// 	console.log(player.files[0])
		// })

		// console.log(player.files[0])
		// spectrums[0].style.height =  "50px"
		_player_start();
	}

	// window.addEventListener("load", load);

})(mouse);