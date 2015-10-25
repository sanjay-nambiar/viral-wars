
var VirusEntity = me.ObjectEntity.extend({
 
    init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);
 
        // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(3, 3);
		
	//shrink bounding box
	this.updateColRect(8, 48, 8, 48);

	this.type = me.game.PLAYER_OBJECT;
	this.isInfecting = false;
	this.infectDuration = 0;
     },
 
    update: function() {
 
	var res = me.game.collide(this);

	if ( !me.input.isKeyPressed('infect') || !res || res.obj.type != me.game.PROGRAM_OBJECT && this.isInfecting) {
	    me.audio.stop("infecting");
	    this.isInfecting = false;
	    this.infectDuration = 0;
    	}

        if (me.input.isKeyPressed('left')) {
            // flip the sprite on horizontal axis
            this.flipX(true);
            // update the entity velocity
            this.vel.x -= this.accel.x * me.timer.tick;
            this.vel.y = 0;
        } else if (me.input.isKeyPressed('right')) {
            // unflip the sprite
            this.flipX(false);
            // update the entity velocity
            this.vel.x += this.accel.x * me.timer.tick;
            this.vel.y = 0;
        } else if (me.input.isKeyPressed('up')) {
	    // update the entity velocity
            this.vel.y -= this.accel.y * me.timer.tick;
            this.vel.x = 0;
	} else if (me.input.isKeyPressed('down')) {
            // update the entity velocity
            this.vel.y += this.accel.y * me.timer.tick;
            this.vel.x = 0;
	} else if (me.input.isKeyPressed('infect') && res && res.obj.type == me.game.PROGRAM_OBJECT && !this.isInfecting && !res.obj.isInfected) {
		this.isInfecting = true;
	}
	else {
            this.vel.x = 0;
	    this.vel.y = 0;
        }
        
        if( this.isInfecting ) {
		if( this.infectDuration === 0 ) {
			me.audio.play("infecting", true);
		}
		this.infectDuration ++;
		if( this.infectDuration == 200 ) {
			this.infectDuration = 0;
			this.infecting = false;
			res.obj.isInfected = true;
			me.audio.stop("infecting");
		}
	}
 
        // update player movement
        this.updateMovement();
        this.parent(this);

        return true;
    },
	
    onCollision : function ()
    {		
    }
 
});




var ProgramEntity = me.ObjectEntity.extend({

    init: function(x, y, settings) {  		
	// call the parent constructor
        this.parent(x, y, settings);
	this.collidable = true;
	this.type = me.game.PROGRAM_OBJECT;
	this.isInfected = false;
	this.previouslyInfected = false;
	
	this.addAnimation("healthy", [0,1,2,3,4,5,6]);
	this.addAnimation("sick", [7,8,9,10,11,12,13]);
	this.setCurrentAnimation("healthy");
    },
    
    update: function() {
	    if( this.isInfected != this.previouslyInfected ) {
		    this.previouslyInfected = this.isInfected;
		    this.setCurrentAnimation( (this.isInfected === true) ? "sick" : "healthy" );
		    me.audio.play("infected", false);
		    jsApp.infected_programs++;
		    
		    jsApp.gridInfo[ this.pos.y/64, this.pos.x/64 ] = (this.isInfected === true) ? 'X' : 'O';
	    }
	    this.updateMovement();
            this.parent(this);
	    return true;
    }
 
});





var AntiVirusEntity = me.ObjectEntity.extend({
    init: function(x, y, settings) {        
 
        // call the parent constructor
        this.parent(x, y, settings);        
 
	this.velFactor = 4;
        // walking & jumping speed
        this.setVelocity(this.velFactor, this.velFactor);

	//shrink bounding box
	this.updateColRect(8, 48, 6, 52);
 
        // make it collidable
        this.collidable = true;
        // make it a enemy object
        this.type = me.game.ENEMY_OBJECT;        
        this.nextMove = 0;
	this.currentTile = {x:14, y:2}; 
	this.destTile = {x:14, y:2};
	this.currentRoute = "x14y2";
	this.currentRouteIndex = 0;
	this.routeVertex = -1;
	this.alertState = Math.floor(jsApp.infected_programs / jsApp.programs * 4);
    },
 
    // call by the engine when colliding with another object
    // obj parameter corresponds to the other object (typically the player) touching this one
    onCollision: function(res, obj) {
         
	if( obj.type == me.game.PLAYER_OBJECT ) {
		 me.state.change(me.state.GAMEOVER, "lose");
	}
    },
 
    // manage the enemy movement
    update: function() {
        // do nothing if not visible
        if (!this.visible)
            return false;
 
        if (this.alive) {
		if( this.nextMove === 1 )
			this.currentTile.x = Math.ceil(this.pos.x / 64 + 1);
		else
			this.currentTile.x = Math.floor(this.pos.x / 64 + 1);

		if( this.nextMove === 3 )
			this.currentTile.y = Math.ceil(this.pos.y / 64 + 1);
		else
			this.currentTile.y = Math.floor(this.pos.y / 64 + 1);

        	this.generateMove();

    	    	if ( this.nextMove === 1 ) {					//left
		    this.flipX(true);
		    this.vel.x -= this.accel.x * me.timer.tick;
		    this.vel.y = 0;
		} else if ( this.nextMove === 2 ) {			//right
		    this.flipX(false);
		    this.vel.x += this.accel.x * me.timer.tick;
		    this.vel.y = 0;
		} else if ( this.nextMove === 3 ) {			//up
		    this.vel.y -= this.accel.y * me.timer.tick;
		    this.vel.x = 0;
		} else if ( this.nextMove === 4 ) {			//down
		    this.vel.y += this.accel.y * me.timer.tick;
		    this.vel.x = 0;
		}
		else {
		    this.vel.x = 0;
		    this.vel.y = 0;
		}
        }

	var state = Math.floor(jsApp.infected_programs / jsApp.programs * 4);
	if( state !== this.alertState ) {
		if( state === 4 ) {
			me.audio.stop("infecting");
			me.state.change(me.state.GAMEOVER, "win");
		}
		else if ( state === 3 ) {
			this.setVelocity(this.velFactor*2, this.velFactor*2);
		}
		else if( state === 2 ) {
			this.setVelocity(this.velFactor*1.5, this.velFactor*1.5);
		}	   
		else {
			this.setVelocity(this.velFactor, this.velFactor);
		}
	}

        // check and update movement
        this.updateMovement();
 
        // update animation
        this.parent(this);
        return true;
    },

    generateMove: function() {
	if( this.nextMove === 5 ) {	
		return;
	}

	if( this.destTile.x !== this.currentTile.x || this.destTile.y !== this.currentTile.y ) {
		if( this.currentTile.x < this.destTile.x ) {
			this.nextMove = 2;
			this.pos.y = (this.currentTile.y - 1 )* 64;
		}
		else if( this.currentTile.x > this.destTile.x ) {
			this.nextMove = 1;
			this.pos.y = (this.currentTile.y - 1 )* 64;
		}
		else if( this.currentTile.y > this.destTile.y ) {
			this.nextMove = 3;
			this.pos.x = (this.currentTile.x - 1 )* 64;
		}
		else if( this.currentTile.y < this.destTile.y ) {
			this.nextMove = 4;
			this.pos.x = (this.currentTile.x - 1 )* 64;
		}
		else 
			this.nextMove = 0;
	}
	else if (this.routeVertex >= 0) {
		this.pos.x = (this.currentTile.x - 1) * 64;
		this.pos.y = (this.currentTile.y - 1) * 64;

		this.destTile.x = jsApp.scriptedRoutes[this.currentRoute][this.currentRouteIndex][this.routeVertex].x;
		this.destTile.y = jsApp.scriptedRoutes[this.currentRoute][this.currentRouteIndex][this.routeVertex].y;
		this.routeVertex++;

		if( this.routeVertex >= jsApp.scriptedRoutes[this.currentRoute][this.currentRouteIndex].length ) {
			this.routeVertex = -1;
			//if( jsApp.gridInfo[this.currentTile.y - 1][this.currentTile.x - 1] === 'X' ) {
			//	this.nextMove = 5;
			//}
		}
	}
	else {
		this.currentRoute = "x"+this.currentTile.x+"y"+this.currentTile.y;
		this.currentRouteIndex = Math.floor(Math.random() * 3);
		this.routeVertex = 0;
		this.destTile.x = jsApp.scriptedRoutes[this.currentRoute][this.currentRouteIndex][this.routeVertex].x;
		this.destTile.y = jsApp.scriptedRoutes[this.currentRoute][this.currentRouteIndex][this.routeVertex].y;
		this.pos.x = (this.currentTile.x - 1) * 64;
		this.pos.y = (this.currentTile.y - 1) * 64;
	}
    }
    
});




var ComputerEntity = me.ObjectEntity.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function(x, y, settings) { 
	// call the parent constructor
        this.parent(x, y, settings);

	this.addAnimation("good", [0]);
	this.addAnimation("normal", [1]);
	this.addAnimation("worrying", [2]);
	this.addAnimation("bad", [3]);
	
	this.setCurrentAnimation("good");
    },

   update: function() {
	   var state = jsApp.infected_programs / jsApp.programs;
	   var animation = "";
	   if( state == 1 ) {
	   	animation = "bad";
	   }
	   else if ( state >= 0.75 ) {
		animation = "worrying";
	   }
	   else if( state >= 0.5 ) {
		animation = "normal";
	   }	   
	   else {
		animation = "good";
	   }
	   if( this.current.name !== animation ) {
	   	this.setCurrentAnimation(animation);
	   	if( this.current.name !== "good" )
	   		me.audio.play("alarm", false);
	   }
   }
});


 
var TitleScreen = me.ScreenObject.extend({
    	// constructor
    init: function() {
        this.parent(true);
 
        // title screen image
        this.title = null;
 
        this.font = null;
        this.scrollerfont = null;
        this.scrollertween = null;
 
        this.scroller = "GET READY TO WREAK HAVOC...";
        this.scrollerpos = 900;
    },
 
    // reset function
    onResetEvent: function() {
	if (this.title == null) {
            // init stuff if not yet done
            this.title = me.loader.getImage("title_screen");
            // font to display the menu items
            this.font = new me.BitmapFont("the_font", 32);
            this.font.set("left");
 
            // set the scroller
            this.scrollerfont = new me.BitmapFont("the_font", 32);
            this.scrollerfont.set("left");
 
        }
 
        // reset to default value
        this.scrollerpos = 960;
 
        // a tween to animate the arrow
        this.scrollertween = new me.Tween(this).to({
            scrollerpos: -2200
        }, 10000).onComplete(this.scrollover.bind(this)).start();
 
        // enable the keyboard
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
     },
 
	// some callback for the tween objects
    scrollover: function() {
        // reset to default value
        this.scrollerpos = 960;
        this.scrollertween.to({
            scrollerpos: -2200
        }, 10000).onComplete(this.scrollover.bind(this)).start();
    },
	
    // update function
    update: function() {
	// enter pressed ?
        if (me.input.isKeyPressed('enter')) {
            me.state.change(me.state.PLAY);
        }
        return true;
    },
 
    // draw function
    draw: function(context) {
	context.drawImage(this.title, 0, 0);
 
        this.font.draw(context, "PRESS ENTER TO PLAY", 180, 520);
        this.scrollerfont.draw(context, this.scroller, this.scrollerpos, 580);
    },
 
    // destroy function
    onDestroyEvent: function() {
	me.input.unbindKey(me.input.KEY.ENTER);
 
        //just in case
        this.scrollertween.stop();
    }
 
});




/* the in game stuff*/
var PlayScreen = me.ScreenObject.extend(
{
	onResetEvent: function()
	{	
		// stuff to reset on state change
		me.levelDirector.loadLevel("level_01");
	  
		/*
		// add a default HUD to the game mngr
		me.game.addHUD(0, 430, 640, 60);

		// add a new HUD item
		me.game.HUD.addItem("score", new ScoreObject(620, 10));
		*/
		// make sure everyhting is in the right order
		me.game.sort();
		
		// play bgm
		me.audio.playTrack("bgm");
	},

	onDestroyEvent: function()
	{
		// remove game hud
		//me.game.disableHUD();
		
		// stop audio playback
		me.audio.stopTrack();
	}

});


var GameOverScreen = me.ScreenObject.extend(
{
	 init: function() {
	        this.parent(true);
	        this.font = null;
	        this.text = "GAME OVER";
    	},
	onResetEvent: function(args)
	{
		this.font = new me.BitmapFont("the_font", 32);
		this.font.set("left");
		if( args === "win" )
			this.text = "YOU WIN!! ";
	},
	draw: function(context) {
		this.font.draw(context, this.text, 320, 250);
	},
	onDestroyEvent: function()
	{		
	}

});

