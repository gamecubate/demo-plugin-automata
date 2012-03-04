ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.background-map',
	'plugins.gamecubate.automata.conway',
	'plugins.symbols.symbols',
	'plugins.outlinedfont',
	'plugins.impact-splash-loader'
	//'impact.debug.debug'
)
.defines(function(){

PluginDemo = ig.Game.extend({

	// don't clear the screen as we want to show the underlying CSS background
	clearColor: null,

	// pause or play?
	gameState: null,
	
	// How big is our simulated world, and what are its constraints?
	COLS: 40,
	ROWS: 60,
	
	// Cellular Automaton(s) and representation view (overlay)
	ca1: null,
	ca2: null,
	ca3: null,
	ca4: null,
	overlay: null,
	
	// Controls the interval at which we tell the automaton(s) to advance one step
	simulationTimer: null,
	stepDuration: 0.1,
	
	// Instructions
	//font: new ig.Font( 'media/04b03-black.font.png' ),
	font: new OutlinedFont('media/outlinedfont.png', 1),

	init: function()
	{
		// Setup game state symbols
		new ig.Symbols("PLAYING PAUSED");

		// Automata maintain state, map depicts those states
		this.initAutomata();
		this.initMap();
		
		// Setup sim timer
		this.simulationTimer = new ig.Timer();

		// Handle mouse events
		ig.input.bind(ig.KEY.SPACE, 'pause');
		ig.input.bind(ig.KEY.RIGHT_ARROW, 'step');
		ig.input.bind(ig.KEY.LEFT_ARROW, 'reset');
		ig.input.bind(ig.KEY.MOUSE1, 'mouse1');
		
		// Go!
		this.gameState = ig.Entity.PLAYING;
	},

	initMap: function ()
	{
		// BG
		var data = this.createData (this.COLS, this.ROWS, 2);
		var bg = new ig.BackgroundMap (8, data, new ig.Image ('media/tiles.png'));
		bg.preRender = true;	// render once and be done with it; will save cycles
		this.backgroundMaps.push (bg);

		// Overlay
		data = this.createData (this.COLS, this.ROWS, 0);
		this.overlay = new ig.BackgroundMap (8, data, new ig.Image ('media/tiles.png'));
		this.backgroundMaps.push (this.overlay);
	},
	
	resetMap: function ()
	{
		this.overlay.data = this.createData (this.COLS, this.ROWS, 0);
	},

	initAutomata: function ()
	{
		this.ca1 = new Conway (10,60);
		this.ca1.populate (0.4);

		this.ca2 = new Conway (10,60);
		this.ca2.populate (0.4);

		this.ca3 = new Conway (10,60);
		this.ca3.populate (0.4);

		this.ca4 = new Conway (10,60);
		this.ca4.populate (0.4);
	},

	resetAutomata: function ()
	{
		this.ca1.reset ();
		this.ca1.populate (0.4);

		this.ca2.reset ();
		this.ca2.populate (0.4);

		this.ca3.reset ();
		this.ca3.populate (0.4);

		this.ca4.reset ();
		this.ca4.populate (0.4);
	},
	
	createData: function (cols, rows, fillValue)
	{
		var fill = fillValue | 0;
		var data = [];
		for (var row=0; row<rows; row++)
		{
			data[row] = [];
			for (var col=0; col<cols; col++)
				data[row][col] = fill;
		}
		return data;
	},
	
	update: function ()
	{
		if (this.gameState & ig.Entity.PLAYING && (this.simulationTimer.delta() > 0 && this.stepDuration > 0))
		{
			// evolve
			this.step ();

			// next step at...
			this.simulationTimer.set (this.stepDuration);
		}

		this.handleKeys();
		this.handleMouse();
		this.parent ();
	},

	step: function ()
	{
		this.ca1.step();
		this.ca2.step();
		this.ca3.step();
		this.ca4.step();

		this.updateMap (this.ca1, this.overlay, 1, 0, 0);
		this.updateMap (this.ca2, this.overlay, 4, 10, 0);
		this.updateMap (this.ca3, this.overlay, 3, 20, 0);
		this.updateMap (this.ca4, this.overlay, 6, 30, 0);
	},

	reset: function ()
	{
		this.resetAutomata ();
		this.resetMap ();
		this.updateMap (this.ca1, this.overlay, 1, 0, 0);
		this.updateMap (this.ca2, this.overlay, 4, 10, 0);
		this.updateMap (this.ca3, this.overlay, 3, 20, 0);
		this.updateMap (this.ca4, this.overlay, 6, 30, 0);
	},
	
	updateMap: function (automaton, map, tileIndex, x, y)
	{
		var states = automaton.data;

		// iterate
		for (var row=0; row<automaton.rows; row++)
		{
			for (var col=0; col<automaton.cols; col++)
			{
				var state = states[row][col];

				if (state == CellState.DEAD)
				{
						map.data[row+y][col+x] = 0;
				}
				else if (state == CellState.ALIVE)
				{
						map.data[row+y][col+x] = tileIndex;
				}
			}
		}
	},

	handleKeys: function()
	{
		if (ig.input.pressed('step'))
		{
			this.step();
		}
		else if (ig.input.pressed('pause'))
		{
			this.gameState = this.gameState == ig.Entity.PAUSED ? ig.Entity.PLAYING : ig.Entity.PAUSED;
		}
		else if (ig.input.pressed('reset'))
		{
			this.reset ();
		}
	},

	handleMouse: function ()
	{
		if (ig.input.released("mouse1"))
		{
			this.reset ();
		}
	},

	draw: function()
	{
		ig.system.context.clearRect (0 ,0, ig.system.realWidth, ig.system.realHeight);
		this.parent();
		this.font.draw ('SPACE: PAUSE/PLAY     LEFT, MOUSE: RESET     RIGHT: STEP', ig.system.width/2, 5, ig.Font.ALIGN.CENTER);
	},
});


// Start the Game with 30fps, a resolution of 320x480, unscaled, and use splash loader plugin
ig.main ('#canvas', PluginDemo, 30, 320, 480, 1, ig.ImpactSplashLoader);

});
