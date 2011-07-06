$(document).ready(function() {
	/* 
	 * a little code which switches between the play and the about page
	 * based on the location.hash
	 */

	if(typeof _gat != 'undefined') var pageTracker = _gat._getTracker("UA-7486115-7");  // initialize pagetracking object for google analytics	
	 
	$(window).hashchange(function(){
		document.title = 'Ganja Farmer';
		var hash = location.hash;
		if(!hash) document.title = 'Ganja Farmer';
		else hash = hash.replace( /^#/, '');
		;
		if(hash == 'about') {
			document.title = 'Ganja Farmer - About';
			$('#about').show();
			$('#play').hide();
			if(pageTracker) pageTracker._trackPageview('about');
		}
		else {
			$('#play').show();
			$('#about').hide();
			if(pageTracker) pageTracker._trackPageview('game');
		}
		
	});
		// Since the event is only triggered when the hash changes, we need to trigger
		// the event now, to handle the hash the page may have loaded with.
		$(window).hashchange();
	
	var playerName = window.localStorage ? window.localStorage.getItem('playerName') : '';
	playerName = playerName? playerName : 'your name';
	
	$('#play').block({ 
        message: 	'<input type="text" id="playername" placeholder="'+playerName+'" />'+
        			'<input type="button" id="newGame" value="play!" />', 
        css: { padding: '10px;', border: '3px solid yellow' }
    });
	
	
	$('#newGame').click(function() {
		$('#play').unblock().css('position','');
		var dom = {
				gameCanvas: $('#gameCanvas').get(0), 
			    calcCanvas: $('#calcCanvas').get(0),
				score: $('#score').get(0),
				lives: $('#lives').get(0)};
		var callbacks = {
				endGame: function(score) {
					$('#play').block({ 
				        message: 	'Your score: '+score+
				        			'<br /><input type="button" onclick="$(\'#play\').unblock().css(\'position\',\'\');window.gf.restart()" value="restart!" />', 
				        css: { padding: '10px;', border: '3px solid yellow' }
				    });
				}
		};
		
		// create the game object
		window.gf = new GanjaFarmer({playername: $('#playername').val(), 'dom': dom, 'callbacks': callbacks});
	
		// mute all sound
		$("#mutesound").click(function(e) {
			gf.sound.mute($(this).is(':checked'));
		});
		// unmute all sound
		$("#unmutesound").click(function(e) {
			gf.sound.mute(!$(this).is(':checked'));
		});
		
		// volume slider (native input[type=range] does not work in FF yet :( )	
		$("#volume").change(function(e) {
			var elem = e.srcElement;
			gf.sound.setVolume(elem.value); });

	})
	// create fancy checkboxes with jQuery UI
	$("#soundtoggle, #musictoggle").buttonset();
});
