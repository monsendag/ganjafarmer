/**
 * Solider object(s)
 * contains solider specific functionality i.e the pendular movement
 * @param game
 * @returns {Solider}
 */
function Solider(game) {
	this.WIDTH = 100;
	this.HEIGHT = 80;
	this.game = game;
	this.sprite = game.getSprite('target_solider'); // the sprite object contains several pictures
	this.image;
	this.offset; 
	this.posX;
	this.posY;
	this.dy = -2; // default falling speed
	this.dead = false;  // decided not to use immutable objects
	
	this.init = function() {
		this.posX = 0;
		this.posY = this.game.centerY;
		this.image = 'normal';
		this.offset = Math.random() * 10;
		// set a random initial position
		this.posX = -(this.game.centerX - this.WIDTH) + (this.game.WIDTH - 2*this.WIDTH) * Math.random();
	}
	
	/**
	 * draws the solider on the game canvas
	 */
	this.draw = function() {
		this.sprite.setPos(this.posX, this.posY);
		
		if(this.posY - this.HEIGHT > 0) {
			this.sprite.draw(this.image, this.pendule.bind(this));
			this.posY += this.dy;
		}
		else {
			if(this.dead) {
				this.image = 'dead';
				this.sprite.draw(this.image);
			}
			else {
				this.game.removeLife();
				this.game.removeSolider(this);
			}
		}
	}
	/**
	 * rotates the sprite
	 * creates a pendular movement for the solider
	 */
	this.pendule = function() { 
		var omega = 4;
		var amplitude = .6;
		var time = this.game.frames/this.game.FPS + this.offset;
		var theta = amplitude*Math.cos(omega*time);
		this.game.ctx.rotate(theta);
	}
	/**
	 * is called when a solider is hit by a bullet
	 * the solider is killed, and starts falling
	 * 
	 */
	this.catchBullet = function() {
		this.dead = true; //
		this.HEIGHT = 52; // affects how far down the solider goes before stopping
		this.dy = -5;  // increase falling speed
		this.image = 'falling'; // set a different image
	}
	
	/**
	 * @param x-coordinate
	 * @param y-coordinate
	 * @return boolean the given coordinate is 'on' the soliders body
	 * is used to calculate bullet hits
	 */
	this.contains = function(x, y) {
		if(!this.sprite.edges) this.sprite.detectEdges('normal');  // edges is not detected -> detect
		if(this.game.isOutOfBorder(x, y)) { return false; }  // out of bounds
		// make integer positions
		var posX = Math.round(this.posX);  
		var posY = Math.round(this.posY);	
		x = Math.round(x); 
		y = Math.round(y);
		
		// get bullet position in image
		var targetX =  x - posX;
		var targetY = y - posY + (this.sprite.currentImage.height-1);
	
		// not in image (yet)
		if(targetX < 0 ||  // left
			targetX >= this.sprite.currentImage.width || // right
			targetY < 0 || // under
			targetY >= this.sprite.edges.length) // over
			{
			return false;
		}
		
		// sprite position
		var leftEdge = this.sprite.edges[targetY][0];
		var rightEdge = this.sprite.edges[targetY][1];
		
		if(typeof this.sprite.edges[targetY] != 'object') return false;
		if(targetX > leftEdge && targetX < rightEdge) return true;
		return false;
	}
	this.init(); // run constructor
}