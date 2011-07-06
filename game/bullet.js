/**
 * The bullets are created when a user clicks on the canvas
 * @param game
 * @returns {Bullet}
 */
function Bullet(game) {
	this.game = game;
	this.sprite = game.getSprite('bullet');
	this.image = this.sprite.getImage('bullet');
	this.posX;
	this.posY;
	this.dx;
	this.dy;
	this.theta = 1;
	this.speed = 5;
	
	this.init = function() {
		
	}
	
	/*
	 * rotates a bullet to fit its direction
	 */
	this.rotate = function() {
		this.game.ctx.rotate(this.theta);
	}
	
	
	this.draw = function() {
		this.sprite.setPos(this.posX, this.posY);
		this.sprite.draw('bullet', this.rotate.bind(this));
	
		this.posX += this.dx;
		this.posY += this.dy;
		
		if(this.game.isOutOfBorder(this.posX, this.posY)) {
			this.game.removeBullet(this);
			delete this;
		}
	}
	/**
	 * calculates the angle which the bullet should be rotated on every draw
	 * and also the speed it should have in the x and y space
	 */
	this.setDirection = function(toX, toY) {	
		// bullet exit position
		refX = -3;   
		refY = 100;
		// set initial bullet position
		this.posX = refX;
		this.posY = refY;
		
		var length = toX-refX;
		var height = toY-refY;
		
		var radius = Math.sqrt(Math.pow(length, 2) + Math.pow(height,2))
		
		var dx=length / (radius != 0 ? radius : 1);
		var dy=height / (radius != 0 ? radius : 1);
		
		var offset = length < 0 ? 3/2 : 5/2;
		
		this.theta = Math.PI*offset - Math.atan(height/length);
		
		this.dx = this.speed*dx;
		this.dy = this.speed*dy;
		
		return this;
	}
	
	this.init();  // run constructor
}