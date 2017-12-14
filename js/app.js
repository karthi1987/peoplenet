'use strict';

Array.prototype.clone = function(){
  return this.map(e => Array.isArray(e) ? e.clone() : e);
};

/*
 * App Namespace
 */
var PeopleNetApp = PeopleNetApp || {};
PeopleNetApp.config = {
	square: {
		width: 30,
		height: 30
	}
}

PeopleNetApp.Square = Backbone.Model.extend({
   /*
	* Types: 'space', 'wall'
	*/ 
	defaults: {
		x: 0,
		y: 0,
		type: 'space',
		distance: null,
		active: false
	}

});

/*
 * Maze Collection for the Square
 */

PeopleNetApp.Maze = Backbone.Collection.extend({
	model: PeopleNetApp.Square
});

/*
 * Starting Coordinates Model( X, Y )
 */
PeopleNetApp.Agent = Backbone.Model.extend({

	defaults: {
		x: 5,
		y: 5
	},

	initialize: function() {
		PeopleNetApp._vent.on('square:setAgentPosition', this.setAgentPosition, this);
	},

	setAgentPosition: function(clickPos) {
		var x = clickPos.get('x');
		var y = clickPos.get('y');
		this.set('x', x);
		this.set('y', y);

	}

});

/*
 * Ending(Destination) Coordinates Model( X, Y )
 */
PeopleNetApp.Goal = Backbone.Model.extend({

	defaults: {
		x: 25,
		y: 25
	},

	initialize: function() {
		PeopleNetApp._vent.on('square:setGoalPosition', this.setGoalPosition, this);
	},

	setGoalPosition: function(clickPos) {
		var x = clickPos.get('x');
		var y = clickPos.get('y');
		this.set('x', x);
		this.set('y', y);

	}

});

/*
 *  Sqaure view in Grid
 */

PeopleNetApp.SquareView = Backbone.View.extend({

	tagName: 'div',
	className: 'square',
	template: _.template($('#squareTemplate').html()),

	events: {
		'click': 'toggleSquare'
	},

	initialize: function() {
		this.model.on('change', _.bind(this.render, this));
	},

	render: function(){

		this.$el.html(this.template(this.model.attributes));
		var left = (this.model.get('x')) * PeopleNetApp.config.square.width;
		var top = (this.model.get('y')) * PeopleNetApp.config.square.width;
		this.$el.css('left', left);
		this.$el.css('top', top);

		if (this.model.get('active')) {
			this.$el.addClass('active');
		} else {
			this.$el.removeClass('active');
		}
		return this;

	},

	toggleSquare: function() {
		if (PeopleNetApp.editState == 'maze') {
			var type = this.model.get('type');
			if (type == 'space') {
				type = 'wall';
			} else {
				type = 'space';
			}
			this.model.set('type', type);
			if (type == 'space') {
				this.$el.addClass('space');
				this.$el.removeClass('wall');
			} else {
				this.$el.addClass('wall');
				this.$el.removeClass('space');
			}
		} else if (PeopleNetApp.editState == 'agent') {
			PeopleNetApp._vent.trigger('square:setAgentPosition', this.model);
		} else if (PeopleNetApp.editState == 'goal') {
			PeopleNetApp._vent.trigger('square:setGoalPosition', this.model);
		}
	}

});


/*
 *  Starting Position view in Grid
 */

PeopleNetApp.AgentView = Backbone.View.extend({

	el: $('.agent'),

	initialize: function(){
		this.render();
		this.model.on('change', _.bind(this.render, this));
	},

	render: function(){
		var left = (this.model.get('x')) * PeopleNetApp.config.square.width;
		var top = (this.model.get('y')) * PeopleNetApp.config.square.width;
		this.$el.css('left', left);
		this.$el.css('top', top);
		return this;
	}

});


/*
 *  Ending Position view in Grid
 */

PeopleNetApp.GoalView = Backbone.View.extend({

	el: $('.goal'),

	initialize: function(){
		this.render();
		this.model.on('change', _.bind(this.render, this));
	},

	render: function(){
		var left = (this.model.get('x')) * PeopleNetApp.config.square.width;
		var top = (this.model.get('y')) * PeopleNetApp.config.square.width;
		this.$el.css('left', left);
		this.$el.css('top', top);
		return this;
	}

});

/*
 *  Maze view in Grid
 */

PeopleNetApp.MazeView = Backbone.View.extend({

	tagName: 'div',
	className: 'maze',
	template: _.template($('#mazeTemplate').html()),
	queue: [],

	initialize: function() {
		this.collection = new PeopleNetApp.Maze(PeopleNetApp.squares);
		this.$el.html(this.template());
		this.render();
		PeopleNetApp._vent.on('controls:findPath', this.startPathFind, this);
		PeopleNetApp._vent.on('controls:clearPath', this.clearPath, this);
		PeopleNetApp._vent.on('controls:clearMaze', this.clearMaze, this);
		PeopleNetApp._vent.on('controls:solidMaze', this.solidMaze, this);
		PeopleNetApp._vent.on('controls:solidMazeTwo', this.solidMazeTwo, this);
	},

	render: function() {
		this.collection.each(function(model) {
			this.renderSquare(model);
		}, this);
	},

	clearPath: function() {
		this.queue = [];
		this.collection.each(function(model) {
			model.set('distance', null);
			model.set('active', false);
		});
	},

	clearMaze: function() {
		this.queue = [];
		this.collection = new PeopleNetApp.Maze(PeopleNetApp.squares);
		this.$el.html(this.template());
		this.render();
	},

	solidMaze: function() {
		return false;
	},

	solidMazeTwo: function() {
		return false;
	},

	renderSquare: function(item){
		var squareView = new PeopleNetApp.SquareView({
			model: item
		});
		this.$el.append(squareView.render().el);
	},

	startPathFind: function() {
		var goal_x = PeopleNetApp.goalModel.get('x');
		var goal_y = PeopleNetApp.goalModel.get('y');
		var square = this.getSquareAt(goal_x, goal_y);
		square.set('distance', 0);
		this.queue.push(square);
		this.findPath();
		var movements = this.createRoute();
	},

	findPath: function() {
		var self = this;
		while (this.queue.length > 0) {
		   /*
			* Dequeue
			*/ 
			var oldestSquare = this.queue.pop();
			var reachedAgent = oldestSquare.get('x') == PeopleNetApp.agentModel.get('x') && oldestSquare.get('y') == PeopleNetApp.agentModel.get('y');
			if (! reachedAgent) {
				var oldDistance = oldestSquare.get('distance');
				var newDistance = oldDistance + 1;
			   /*
				* Enqueue adjacent steps
				*/ 
				var adjacentSquares = this.getAdjacent(oldestSquare.get('x'), oldestSquare.get('y'));
				adjacentSquares.forEach(function(adjSq) {
					var adjacentSquare = self.getSquareAt(adjSq.x, adjSq.y);
					if (adjacentSquare.get('distance') == null) {
						adjacentSquare.set('distance', newDistance);
						self.queue.unshift(adjacentSquare);
					}
				});
			}
		}
	},

	getSquareAt: function(x, y) {
		return this.collection.findWhere({x: x, y: y});
	},

	getAdjacent: function(x, y) {
		var adjacent = [];
		if (x > 0 && ! this.isWall(x - 1, y)) {
			adjacent.push({x: x - 1, y: y});
		}
		if (x < (PeopleNetApp.width - 1) && ! this.isWall(x + 1, y)) {
			adjacent.push({x: x + 1, y: y});
		}
		if (y > 0 && ! this.isWall(x, y - 1)) {
			adjacent.push({x: x, y: y - 1});
		}
		if (y < (PeopleNetApp.height - 1) && ! this.isWall(x, y + 1)) {
			adjacent.push({x: x, y: y + 1});
		}
		return adjacent;
	},

	isWall: function(x, y) {
		var square = PeopleNetApp.mazeView.collection.findWhere({x: x, y: y});
		return square.get('type') == 'wall';
	},

	createRoute: function() {
		var movements = [];
		var old_x = PeopleNetApp.agentModel.get('x');
		var old_y = PeopleNetApp.agentModel.get('y');
		/* get distance value at start square: */
		var square = this.getSquareAt( old_x, old_y );
		while ( square.get('distance') > 0 ) {
			square = this.findSquare(square);
			if ( square ) {
				square.set('active', true);
				var movement = this.getMovement(old_x, old_y, square.get('x'), square.get('y'));
				movements.push(movement);
				old_x = square.get('x');
				old_y = square.get('y');
			}
		}
		return movements;
	},

	findSquare: function( prevSquare ) {

		let self = this;
		let i = 0;
		let adjacent = this.getAdjacent(prevSquare.get('x'), prevSquare.get('y'));
		for ( ; i < adjacent.length; i++ ) {
			let adjSq = adjacent[ i ];
			let adjacentSquare = self.getSquareAt( adjSq.x, adjSq.y );
			if ( adjacentSquare.get('distance') == (prevSquare.get('distance') - 1) ) {
				return adjacentSquare;
			}
		}
	},

	getMovement: function( x1, y1, x2, y2 ) {

		if ( x2 > x1 ) {
			return 'right';
		}
		if ( x2 < x1 ) {
			return 'left';
		}
		if ( y2 > y1 ) {
			return 'down';
		}
		if ( y2 < y1 ) {
			return 'up';
		}
	}
});

/*
 * PeopleNetApp Events View( button click events )
 */

PeopleNetApp.ControlsView = Backbone.View.extend({

	el: $('.controls'),
	events: {
		'click .stateButton': 'setState',
		'click .findPath': 'findPath',
		'click .clearPath': 'clearPath',
		'click .clearMaze': 'clearMaze',
		'click .mazeFirstBtn': 'solidMaze',
		'click .mazeSsecondBtn': 'solidMazeTwo',
	},
	setState: function(e) {
		var state = e.currentTarget.id.replace('_btn', '');
		PeopleNetApp.editState = state;
	},
	findPath: function() {
		PeopleNetApp._vent.trigger('controls:findPath');
	},
	clearPath: function() {
		PeopleNetApp._vent.trigger('controls:clearPath');
	},
	clearMaze: function() {
		PeopleNetApp._vent.trigger('controls:clearMaze');
	},
	solidMaze: function() {
		PeopleNetApp._vent.trigger('controls:solidMaze');
	},
	solidMazeTwo: function() {
		PeopleNetApp._vent.trigger('controls:solidMazeTwo');
	}


});

PeopleNetApp.triggerEvents = ( props ) => {

	var mazeCloneOne = mazeOne.clone();
	var mazeCloneThree = mazeThree.clone();

	let params = { metrics: mazeCloneThree, start: mazeThreeStart, end: mazeThreeEnd, rows: mazeThreeRow, columns: mazeThreeColumns, name: 'large-matrix' };
	if ( props === 'mazeFirstBtn' ) {
		params = { metrics: mazeCloneOne, start: mazeOneStart, end: mazeOneEnd, rows: mazeOneRows, columns: mazeOneColumns, name: 'small-matrix' };
	}
	let mazePredefined = new PeopleNet( params );
	let generatedMaze = mazePredefined.generateMaze();
	let shortestPath = '<div>';
	 	  shortestPath = 'Path: ';
		  shortestPath += JSON.stringify( generatedMaze.path );
		  shortestPath += '</div>';

	$("#staticMazePath").html( shortestPath );
	$("#staticMaze").html( generatedMaze.maze );

}

PeopleNetApp.buttonEvenets = () => {

	$('.mazeFirstBtn, .mazeSsecondBtn').on('click', ( event ) => {
		event.preventDefault();
		let $this = $( event.currentTarget);
		if ( $this.hasClass('mazeFirstBtn') ) {
			PeopleNetApp.triggerEvents('mazeFirstBtn');
		} else {
			PeopleNetApp.triggerEvents('mazeSecondBtn');
		}
		return false;
	})

	$('.mazeFirstBtn').trigger('click');
}

/*
 * PeopleNetApp Initialization
 */

PeopleNetApp.init = ( width, height ) => {

    PeopleNetApp.width = width;
    PeopleNetApp.height = height;
    PeopleNetApp.editState = 'maze'; /* or 'agent' or 'goal' */
    PeopleNetApp._vent = _.extend({}, Backbone.Events);
    PeopleNetApp.squares = [];
    let y = 0;
    let x = 0;
    for ( y = 0; y < PeopleNetApp.height; y++ ) {
        for ( x = 0; x < PeopleNetApp.width; x++ ) {
            PeopleNetApp.squares.push( { x:x, y:y } );
        }
    }

    PeopleNetApp.mazeView = new PeopleNetApp.MazeView();
    $('#maze').append(PeopleNetApp.mazeView.el);
    /* Agent: */
    PeopleNetApp.agentModel = new PeopleNetApp.Agent();
    PeopleNetApp.agentView = new PeopleNetApp.AgentView({model: PeopleNetApp.agentModel });
    /* Goal: */
	PeopleNetApp.goalModel = new PeopleNetApp.Goal();
    PeopleNetApp.goalView = new PeopleNetApp.GoalView({model: PeopleNetApp.goalModel });
    /* Controls: */
    new PeopleNetApp.ControlsView();
    PeopleNetApp.buttonEvenets();

}

$(function(){
	PeopleNetApp.init( 30, 30 )
});