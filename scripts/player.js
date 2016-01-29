;(function(){

	var player;

	function _player_start(){
		player.play();
	}

	function load(){
		player = document.getElementById("player");
		_player_start();
	}

	window.addEventListener("load", load);

})();