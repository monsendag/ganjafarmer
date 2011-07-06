function Farmer(game) {
	this.game = game;
	this.sprite = game.getSprite('farmer');
	this.image = 'up';
	this.posX = -50;
	this.posY = 160;
	
	this.init = function() {
	
	}
	
	this.draw = function() {
		this.sprite.setPos(this.posX, this.posY);
		this.sprite.draw(this.image);
	}
	
	this.fire = function(x, y) {
		game.sound.playFire();
		game.addBullet(new Bullet(this.game).setDirection(x,y));
		return false; // prevents default action (selecting text with doubleclick)
	}
	
	this.aim = function(x, y) {	
		var diag = 15;
		var high = 100;
		// left
		if(x < -diag) {
			if(y > high) this.image = 'topleft';
			else this.image = 'left';
		}
		// right
		else if(x > diag) {
			if(y > high) this.image = 'topright';
			else this.image = 'right';	
		}
		// up
		else this.image = 'up';
	}
	this.init();
}