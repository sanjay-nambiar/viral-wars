
// game resources
var g_resources = [
//level_01
{
    name: "level_01_tileset",
    type: "image",
    src: "assets/levels/level_01/level_01_tileset.png"
},
{
    name: "level_01_metatiles",
    type: "image",
    src: "assets/levels/level_01/level_01_metatiles.png"
},
{
    name: "level_01_parallax",
    type: "image",
    src: "assets/levels/level_01/level_01_parallax.png"
},
{
    name: "level_01",
    type: "tmx",
    src: "assets/levels/level_01.tmx"
},
{
    name: "virus",
    type: "image",
    src: "assets/sprites/virus.png"
},
{
    name: "program",
    type: "image",
    src: "assets/sprites/program.png"
},
{
    name: "scan",
    type: "image",
    src: "assets/sprites/scan.png"
},
{
    name: "anti_virus",
    type: "image",
    src: "assets/sprites/anti_virus.png"
},
{
    name: "computer",
    type: "image",
    src: "assets/sprites/computer.png"
},
// game font
{
    name: "the_font",
    type: "image",
    src: "assets/GUI/font.png"
},
// title screen
{
    name: "title_screen",
    type: "image",
    src: "assets/GUI/title.png"
},
// audio resources
{
    name: "infecting",
    type: "audio",
    src: "assets/audio/",
    channel: 1
}, {
    name: "infected",
    type: "audio",
    src: "assets/audio/",
    channel: 1
}, {
    name: "alarm",
    type: "audio",
    src: "assets/audio/",
    channel: 1
}, {
    name: "powerup",
    type: "audio",
    src: "assets/audio/",
    channel: 1
}, {
    name: "split",
    type: "audio",
    src: "assets/audio/",
    channel: 1
}, {
    name: "caught",
    type: "audio",
    src: "assets/audio/",
    channel: 1
},
{
    name: "bgm",
    type: "audio",
    src: "assets/audio/",
    channel: 1
}];


var jsApp	= 
{
	programs: 8,
	infected_programs: 0,
	vertex: 0,
	edge: 0,

	onload: function()
	{
		// init the video
		if (!me.video.init('jsapp', 960, 640, false, 1.0))
		{
			alert("Sorry but your browser does not support html 5 canvas.");
		        return;
		}
				
		// initialize the "audio"
		me.audio.init("mp3,ogg");

		// set all resources to be loaded
		me.loader.onload = this.loaded.bind(this);
		
		// set all resources to be loaded
		me.loader.preload(g_resources);

		// load everything & display a loading screen
		me.state.change(me.state.LOADING);
		
		me.sys.gravity = 0;		
		me.game.PLAYER_OBJECT = me.game.ENEMY_OBJECT + 100;
		me.game.PROGRAM_OBJECT = me.game.ENEMY_OBJECT + 101;

		// draw bounding box
		//me.debug.renderHitBox = true;
		
	},
	
	
	loaded: function ()
	{
		// set the "menu" Screen Object
		me.state.set(me.state.MENU, new TitleScreen());
	
		// set the "Play/Ingame" Screen Object
		me.state.set(me.state.PLAY, new PlayScreen());
		
		//set game over screen
		me.state.set(me.state.GAMEOVER, new GameOverScreen());
      
		// set a global fading transition for the screen
		me.state.transition("fade", "#FFFFFF", 250);
	
		// add entities in the entity pool
		me.entityPool.add("virus", VirusEntity);
		me.entityPool.add("program", ProgramEntity);
		me.entityPool.add("anti_virus", AntiVirusEntity);
		me.entityPool.add("computer", ComputerEntity);
             
		// enable the keyboard
		me.input.bindKey(me.input.KEY.LEFT,  "left");
		me.input.bindKey(me.input.KEY.RIGHT, "right");
		me.input.bindKey(me.input.KEY.UP,    "up");
		me.input.bindKey(me.input.KEY.DOWN,  "down");
		me.input.bindKey(me.input.KEY.X,     "infect");
		
		me.input.bindKey(me.input.KEY.W, "w");
		me.input.bindKey(me.input.KEY.A, "a");
		me.input.bindKey(me.input.KEY.S, "s");
		me.input.bindKey(me.input.KEY.D, "d");		

		// start the game 
		me.state.change(me.state.MENU);
	},
	
	gridInfo: [	['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
			['#', ' ', 'O', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
			['#', ' ', '#', ' ', ' ', '#', '#', ' ', '#', ' ', '#', '#', '#', ' ', '#'],
			['#', ' ', '#', ' ', 'O', '#', ' ', ' ', '#', ' ', ' ', 'O', '#', ' ', '#'],
			['#', ' ', ' ', ' ', '#', '#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
			['#', ' ', ' ', ' ', ' ', ' ', ' ', '#', '#', 'O', '#', ' ', ' ', ' ', '#'],
			['#', ' ', '#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#', 'O', ' ', ' ', '#'],
			['#', ' ', '#', '#', 'O', ' ', '#', '#', ' ', ' ', '#', '#', ' ', ' ', '#'],
			['#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'O', ' ', ' ', ' ', ' ', 'O', '#'],
			['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
	],
	        
	scriptedRoutes: {
		"x14y2": [
			[{x:14,y:9}],
			[{x:14,y:7}, {x:12,y:7}],
			[{x:10,y:2}, {x:10,y:4}, {x:12,y:4}]
		],
		"x3y2": [
			[{x:5,y:2}, {x:5,y:4}],
			[{x:2,y:2}, {x:2,y:6}, {x:5,y:6}, {x:5,y:8}],
			[{x:2,y:2}, {x:2,y:9}, {x:5,y:9}, {x:5,y:8}]
		],
		"x5y4": [
			[{x:4,y:4}, {x:4,y:5}, {x:2,y:5}, {x:2,y:2}, {x:3,y:2}],
			[{x:4,y:4}, {x:4,y:7}, {x:5,y:7}, {x:5,y:8}],
			[{x:5,y:2}, {x:10,y:2}, {x:10,y:4}, {x:12,y:4}]
		],
		"x5y8": [
			[{x:5,y:6}, {x:4,y:6}, {x:4,y:4}, {x:5,y:4}],
			[{x:5,y:9}, {x:9,y:9}],
			[{x:5,y:7}, {x:10,y:7}, {x:10,y:6}]
		],
		"x9y9": [
			[{x:9,y:7}, {x:5,y:7}, {x:5,y:8}],
			[{x:10,y:9}, {x:10,y:6}],
			[{x:14,y:9}]
		],
		"x10y6": [
			[{x:10,y:5}, {x:7,y:5}, {x:7,y:7}, {x:5,y:7}, {x:5,y:8}],
			[{x:10,y:4}, {x:12,y:4}],
			[{x:10,y:9}, {x:14,y:9}]
		],
		"x14y9": [
			[{x:9,y:9}],
			[{x:14,y:7}, {x:12,y:7}],
			[{x:14,y:5}, {x:12,y:5}, {x:12,y:4}]
		],
		"x12y7": [
			[{x:12,y:4}],
			[{x:13,y:7}, {x:13,y:9}, {x:14,y:9}],
			[{x:12,y:5}, {x:10,y:5}, {x:10,y:6}]
		],
		"x12y4": [
			[{x:10,y:4}, {x:10,y:6}],
			[{x:12,y:5}, {x:14,y:5}, {x:14,y:9}],
			[{x:12,y:5}, {x:14,y:5}, {x:14,y:2}, {x:3,y:2}]
		]
	}
};

//bootstrap :)
window.onReady(function() 
{
	jsApp.onload();
});
