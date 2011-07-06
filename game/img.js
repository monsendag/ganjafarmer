function Img(game, id, path) {
	this.game = game;
	this.width  = 0;
	this.height = 0;
	this.img;
	
	this.init = function(id, path) {
		this.game.numImages++;
		this.load(id, path);
	}
	
	this.load = function(id, path) {
		this.img = new Image();
		this.img.id = id;
		this.img.onload = this.onload.bind(this);
		this.img.src = path;
	}
	
	this.get = function() {
		return this.img;
	}
	
	this.onload = function(e) {
		var img = e.target;
		this.img.width = img.width;
		this.img.height = img.height;
		this.game.loadedImages++;
		this.game.start();
	}
	this.init(id, path);
}