/**
 * set a prototype for all functions
 * this allows me to keep the class scope when using functions as parameters
 */
Function.prototype.bind = function(obj) { 
	var method = this;
	var temp = function() {
		return method.apply(obj, arguments);
	};
	return temp; 
}

/**
 * The main game object
 * @param domElements object with DOM elements used to output data (score, lives, current level)
 * This object coordinates the execution of the game
 */
function GanjaFarmer(settings) {
	this.settings = settings;	
	this.domElements = settings.dom;  //
	this.WIDTH = 750;	// canvas dimensions
	this.HEIGHT = 450;
	this.centerX = 375; // canvas center
	this.centerY = 449;
	this.FPS = 40;		// set the wanted execution rate
	this.interval; 		// holds the id of the intervalObject
	this.ctx = this.domElements.gameCanvas.getContext('2d'); // the context used for drawing
	this.sound;		// sound object 
	this.farmer;	// farmer 
	this.frames = 0;	// framecount
	this.prevSec;	// previous second (used to make 

	this.startTime;	// time of game start
	this.lastTime = 0;	// 
	this.totalTime = 0;
	this.updateTime = 0;
	this.updateFrames = 0;
	
	/* these variables are used to prevent the game from starting 
	 * before all images are loaded. (see img.js)
	 * 
	 */
	this.numImages = 0;
	this.loadedImages = 0; 
	
	// self explanatory
	this.level = 1;
	this.score = 0;	
	this.lives = 26;
	
	/**
	 * constructor (see bottom of object)
	 */
	this.init = function() {
		if(window.localStorage) {
			window.localStorage.setItem('playerName', this.settings.playername);
		}
		/* SPRITES */
		// background
		this.sprites['background'] = new Sprite(this).addImages({background: 'gfx/background.png'});
		// weeds
		this.sprites['weed'] = new Sprite(this).addImages({green: 'gfx/weed_green.png',
															fire1: 'gfx/weed_fire1.png',
															fire2: 'gfx/weed_fire2.png',
															fire3: 'gfx/weed_fire3.png'});
		// bullet
		this.sprites['bullet'] = new Sprite(this).addImages({bullet: 'gfx/bullet.png'});
		// solider
		this.sprites['target_solider'] = new Sprite(this).addImages({normal: 'gfx/solider_flying.png',
																	falling: 'gfx/solider_falling.png',
																	 dead: 'gfx/solider_dead.png'});
		// farmer
		this.sprites['farmer'] = new Sprite(this).addImages({left: 'gfx/farmer_left.png',
											 topleft: 'gfx/farmer_topleft.png',
											 up: 'gfx/farmer_up.png',
											 topright: 'gfx/farmer_topright.png',
											 right: 'gfx/farmer_right.png'});
		// load sound framework
		this.sound = new Sound(this);
		// load farmer class (because it is always displayed)
		this.farmer = new Farmer(this);
		// load all weeds
		for(var i = 0; i <26; i++) { this.addWeed(new Weed(this)); }
	}
	
	/**
	 * is called when all images are loaded
	 */
	this.start = function() {
		// when all images are done loading, start game
		if(this.numImages == this.loadedImages) {

			// prevent doubleclick to fire browser event (i.e select text)
			this.domElements.gameCanvas.onselectstart = function() { return(false); };
			// mouse aim listener
			this.domElements.gameCanvas.onmousemove = this.mouseMove.bind(this);
			// set mouse fire listener
			this.domElements.gameCanvas.onmousedown = this.mouseFire.bind(this);	
			// initialize score and lives
			this.score = 0;  
			this.lives = 26;
			this.level = 1;
			
			this.soliders = [];
			this.deadSoliders = [];
			this.bullets = [];
			
			this.domElements.score.innerHTML = this.score;
			this.domElements.lives.innerHTML = this.lives;
			// save script start time
			this.startTime = new Date().getTime();
			this.log('Starting game!');
			// play theme song
			this.sound.playTheme();
			// set clock signal signal
			this.interval = setInterval(this.clock.bind(this), 1000/this.FPS);
		}
	}
	
	this.restart = function() {
		this.stop();
		this.start();
	}
	
	/**
	 * stop game
	 */
	this.stop = function() {
		// remove event listeners
		this.domElements.gameCanvas.onselectstart = false;
		this.domElements.gameCanvas.onmousemove = false;
		this.domElements.gameCanvas.onmousedown = false;	
		
		this.sound.pauseTheme();  // stop sound
		clearInterval(this.interval); // stop clock signal
	}
	
	/**
	 * clock function
	 * this is called for every cycle
	 * main task is to redraw all objects
	 */
	this.clock = function() {
		this.frames++;
		
		var now = new Date().getTime();
		var currSec = Math.round((now-this.startTime)/1000);
		if(currSec != this.prevSec) { // the following runs every second
			this.prevSec = currSec;
			
			var delta = now-this.lastTime;
			
			this.lastTime = now;
			this.totalTime += delta;
			this.updateTime += delta;
			this.updateFrames++;
			
			var frameRate = (this.frames/(currSec+1)).toFixed(2);
				
	        this.updateTime = 0;
	        this.updateFrames = 0;
			this.addTargets();
			this.removeDeadTargets();
		}
		
		this.detectCollisions();
		
		this.draw();
		
		if(this.lives <= 0) {
			this.stop();
			this.settings.callbacks.endGame(this.score);
			this.log('game over! Score: '+this.score);
		}
	}
	
	/**
	 * draws all objects on the canvas
	 * each object has specific settings
	 * therefore they have their own draw function
	 */
	this.draw = function() {
		// draw background
		this.ctx.drawImage(this.getSprite('background').getImage('background'), 0, 0);
		// draw weeds 
		this.drawWeeds();
		// draw (alive) soliders
		for(var i in this.soliders) { this.soliders[i].draw(); } 
		// draw dead solides
		for(var i in this.deadSoliders) { this.deadSoliders[i].draw(); } 
		// draw bullets
		for(var i in this.bullets) { this.bullets[i].draw(); }
		// draw farmer
		this.farmer.draw();
	}
	/**
	 * draw weeds
	 */
	this.drawWeeds = function() {
		var posX = -365;
		var posY = 105;
		var k = 0;
		for(var i in this.weeds) {
			this.weeds[i].burning = (k++ < (26 - this.lives));
			this.weeds[i].posX = posX;
			this.weeds[i].posY = posY;
			this.weeds[i].draw();
			posX += 28;
		}
	}
	
	/**
	 * a wrapper for console.log
	 */
	this.log = function() {
		if (window.console && window.console.log)
			window.console.log('[GanjaFarmer] ' + Array.prototype.join.call(arguments,' '));
	}
	
	/**
	 * aims farmer at mouse position
	 */
	this.mouseMove = function(e) {
		var x = this.coordX(e.offsetX);
		var y = this.coordY(e.offsetY);
		this.farmer.aim(x,y);
	}
	
	/**
	 * fires a bullet at mouse position
	 */
	this.mouseFire = function(e) {
		var x = this.coordX(e.clientX-this.domElements.gameCanvas.offsetLeft);
		var y = this.coordY(e.clientY-this.domElements.gameCanvas.offsetTop);	
		this.farmer.fire(x,y);
	}
	
	/**
	 * array and encapsulation methods for all sprites
	 */
	this.sprites = [];
	this.addSprite = function(sprite) {
		this.sprites.push(sprite);
	}
	this.removeSprite = function(sprites) { 
		this.sprites.splice(this.sprites.indexOf(sprites), 1);
		delete sprites;
	}
	this.getSprite = function(name) {
		return this.sprites[name];
	}
	
	
	/**
	 * array and encapsulation methods for all weeds
	 */
	this.weeds = [];
	this.addWeed = function(weed) {
		this.weeds.push(weed);
	}
	this.removeWeed = function(weed) { 
		this.weeds.splice(this.weeds.indexOf(weeds), 1);
		delete weeds;
	}
	
	/**
	 * array and encapsulation methods for all (alive) soliders
	 */
	this.soliders = [];
	this.addSolider = function(solider) {
		this.soliders.push(solider);
	}
	this.removeSolider = function(solider) { 
		this.soliders.splice(this.soliders.indexOf(solider), 1);
		delete solider;
	}

	/**
	 * array and encapsulation methods for all (dead) soliders
	 */
	this.deadSoliders = [];
	this.addDeadSolider = function(solider) {
		this.deadSoliders.push(solider);
	}
	this.removeDeadSolider = function(solider) { 
		this.deadSoliders.splice(this.deadSoliders.indexOf(solider), 1);
		delete solider;
	}
	
	/**
	 * array and encapsulation methods for all (dead) bullets
	 */
	this.bullets = [];	
	this.addBullet = function(bullet) {
		this.bullets.push(bullet);
	}
	this.removeBullet = function(bullet) { 
		this.bullets.splice(this.bullets.indexOf(bullet), 1);
		delete bullet;
	}
	
	
	/**
	 * adds soliders if there are space
	 * for each level, another solider is added each time
	 */
	this.addTargets = function() {
		if(this.soliders.length < 10) {
			for(var i = 0; i < this.level; i++) {
				this.addSolider(new Solider(this));
			}
		}
	}
	
	/**
	 * flushes dead targets when over 15 units
	 * both layout and performances reasons
	 */
	this.removeDeadTargets = function() {
		while(this.deadSoliders.length > 15) {
			var solider = this.deadSoliders.shift();
			delete solider;
		}
	}
	
	/**
	 * increments kill count
	 * keeps track of levels
	 */
	this.addKill = function() {
		this.domElements.score.innerHTML = ++this.score;
		if(this.score % 30 == 0) {
			this.log('Reached level '+(++this.level));
		} 
	}
	
	/**
	 * removes a life
	 */
	this.removeLife = function() {
		this.domElements.lives.innerHTML = --this.lives;
	}
	
	
	/**
	 * a wrapper for the X-coordinate
	 * makes the center of my coordinate system to be in the center of the canvas
	 */
	this.coordX = function(x) {
		return x - this.centerX;
	}
	
	/**
	 * a wrapper for the Y-coordinate
	 * in the browser, the coordinate system is upside down
	 * using this wrapper makes physics calculations easier
	 */
	this.coordY = function(y) {
		return this.centerY - y;
	}
	
	/**
	 * need to wrap the contexts translate function as well, since i adjusted my coordinate system
	 */
	this.contextTranslate = function(x, y) {
		this.ctx.translate(this.centerX+x, this.coordY(y));
	}
	
	/**
	 * @param x-coordinate
	 * @param y-coordinate
	 * @return boolean given coordinate is out of canvas borders
	 */
	this.isOutOfBorder = function(x, y) {
		return (x < -this.centerX ||  // left 
				x > this.centerX ||  // right 
				y < 0 || // under
				y > this.HEIGHT); // over 
	}
	
	/**
	 * compares all bullets with all soliders, and checks for intersection
	 * if i had the time, i might have tried to do some optimalizations here...
	 * but it works
	 */
	this.detectCollisions = function() {
		for(var i=0; i< this.soliders.length; i++) {
			var solider = this.soliders[i];
			for(var j=0; j< this.bullets.length; j++) {
				var bullet = this.bullets[j];
				if(solider.contains(bullet.posX, bullet.posY)) {
					this.addKill();
					solider.catchBullet();
					this.removeSolider(solider);
					this.addDeadSolider(solider);
					this.removeBullet(bullet);
				}
			}
		}
	}
	this.init(); // run constructor
}