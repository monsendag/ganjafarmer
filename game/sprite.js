/**
 * The sprite object holds all images
 * is also used to draw on the canvas
 * @param game
 * @returns {Sprite}
 */function Sprite(game) {
	this.game = game;
	this.calcCtx = this.game.domElements.calcCanvas.getContext('2d');
	this.images;
	this.currentImage;
	this.edges;
	this.posX;
	this.posY;
	
	this.init = function() {
		
	}
	/**
	 * @param img_id id of the image we want to draw
	 * (optional) @param func a function to be called before restoring the canvas state
	 */
	this.draw = function(img_id, func) {
		if(!this.currentImage) this.setImage(img_id);
		this.game.ctx.save();
		this.game.contextTranslate(this.posX, this.posY);
		if(typeof func == 'function') func();
		this.game.ctx.drawImage(this.getImage(img_id), 0, 0);
		this.game.ctx.restore();
	}
	
	this.setPosX = function(posX) {
		this.posX = posX;
	}
	
	this.setPosY = function(posY) {
		this.posY = posY;
	}
	
	this.setPos = function(posX, posY) {
		this.setPosX(posX);
		this.setPosY(posY);
	}
	
	/**
	 * @param paths a dictionary with image ids as keys and paths as values
	 * loads all images into memory for later usage
	 */
	this.addImages = function(paths) {
		this.images = [];
		for(var id in paths) {
			this.images[id] = new Img(this.game, id, paths[id]).get();
		}
		return this;
	}
	
	this.getImage = function(id) {
		return this.images[id];
	}
	
	this.setImage = function(id) {
		this.currentImage = this.images[id];
	}
	
	/**
	 * uses a different canvas to detect the true edges of an image
	 * uses the getImageData to check on pixel level wether a pixel is opaque
	 * if more than half visible, consider it
	 * @returns a matrix with coordinates of left and right edges
	 */
	this.detectEdges = function(img_id) {
		var img = this.getImage(img_id);
		var edges = new Array(img.height);	
		
		this.calcCtx.drawImage(img, 0, 0, img.width, img.height);
		var imagedata = this.calcCtx.getImageData(0, 0, img.width, img.height);
	
		var i = 0;
		for(var y=(imagedata.height-1); y >= 0; y--) { // iterate over y-axis
			var leftEdge = -1;
			var rightEdge = -1;
				
			for(var x=0; x < imagedata.width; x++) { // iterate over x-axis
				var alphaIndex = (((y * imagedata.width) + (x + 1)) * 4) - 1;
				var alpha = imagedata.data[alphaIndex];
				// if the pixel is more than half opaque, consider it solid
				if(alpha > 127) {
					if(leftEdge == -1) {
						leftEdge = x;
					} 
					else {
						rightEdge = x;
					}
				}
			}
			if(leftEdge == -1) {
				// there are no solid pixels in this row
				edges[i] = 0;
			}
			else if(rightEdge == -1) {
				// there is only one solid pixel in this row
				rightEdge = leftEdge;
				edges[i] = [leftEdge, rightEdge];
			} 
			else {
				edges[i] = [leftEdge, rightEdge];
			}
			i++;
		}
		//		this.drawEdges(edges);
		this.edges = edges;
	}
	
	/**
	 * this method draws the given edges on the calculation canvas
	 * to display the result from detectEdges
	 * not used on live though..
	 */
	this.drawEdges = function(edges) {
		var width = 0;
		for(var y=0; y < edges.length; y++) {
			if(edges[y]) {
				var leftEdge = edges[y][0];
				var rightEdge = edges[y][1];
				// we add three, one for each side, and one more because width is always one more
				var tmpWidth = rightEdge - leftEdge + 3;
				if(tmpWidth > width) width = tmpWidth;
			}
		}
	    var imageData = this.calcCtx.createImageData(width, edges.length);
	    imageData.width = width;
	    imageData.height = edges.length;
	    for(var y=edges; y < 40; y++) {
	    	if(edges[y]) {
				var leftX = edges[y][0];
				var rightX = edges[y][1];
				var leftIndex = (y * width * 4) + (leftX * 4) + 1;
				var rightIndex = (y * width * 4) + (rightX * 4) + 2;
				imageData.data[leftIndex] = 255;
				imageData.data[rightIndex] = 255;
				// make the alpha channel fully opaque
				imageData.data[leftIndex + 2] = 255;
				imageData.data[rightIndex + 1] = 255;
			}
	    }
	    
	    this.calcCtx.putImageData(imageData, 0, 0);
	    return 1;
	}
	
	this.init();
}