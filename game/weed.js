/**
 * The weed object keeps control of which image the sprite should use when drawing
 * @param game
 * @returns {Weed}
 */
function Weed(game) {
	this.game = game;
	this.sprite = game.getSprite('weed');
	this.image = 'green';
	this.posX;
	this.posY;
	this.offset;
	this.burning = false;
	
	this.init = function() {
		this.offset = Math.round(Math.random()*10);
	}
	
	this.draw = function() {
		if(this.burning) {
			var frames = this.game.frames+this.offset;
			if(frames % 2 == 0 || frames % 3 == 0) this.image = 'fire1';
			else if(frames % 5 == 0 || frames % 7 == 0) this.image = 'fire2';
			else this.image = 'fire3';
		}
		else { this.image = 'green'; }
		
		this.sprite.setPos(this.posX, this.posY);
		this.sprite.draw(this.image);	
	}
	
	
	this.init();  // run constructor
}