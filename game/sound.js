function Sound(game) {
	this.game = game;
	this.theme;
	this.fire;
	
	this.init = function() {
		if(window.Audio) {
			this.theme = new Audio("sound/theme.ogg");
			this.fire = new Audio("sound/fire.ogg");
			this.theme.volume = this.fire.volume = 0.5;
		}
		else {
			game.log('No audio API available!');
		}
	}
	
	this.playTheme = function() {
		this.theme.play();
	}
	
	this.playFire = function() {
		return false;
//		if(this.fire.ended) this.fire.play();
	}
	
	this.pauseTheme = function() {
		this.theme.pause();
	}
	
	this.mute = function(mute) {
		this.theme.muted = mute;
		this.theme.muted = mute;
		
	}
	
	this.setVolume = function(volume) {
		this.theme.volume = (volume/100);
		this.fire.volume = (volume/100);
	}
	
	this.init();
}