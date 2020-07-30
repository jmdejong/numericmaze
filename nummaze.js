"use strict";


var Tiles = {
	Empty: Symbol("Empty"),
	Wall: Symbol("Wall"),
}

var Status = {
	Playing: Symbol("Playing"),
	Lost: Symbol("Lost"),
	Won: Symbol("Won")
}

function pick(ar){
	return ar[Math.random() * ar.length |0];
}

var neighbours = [[0, 1], [0, -1], [1, 0], [-1, 0]];
var secondNeighbours = [[0, 2], [0, -2], [2, 0], [-2, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];

var validKeys = new Map();
for (let i=0; i<10; ++i){
	validKeys.set(i+"", i);
}

class Player{
	x = 0;
	y = 0;
}

class World {
	
	tile_size = 24;
	
	constructor(width, height, max, time){
		this.width = width;
		this.height = height;
		this.max = max;
		this.time = time;
		this.status = Status.Playing;
		this.tiles = new Grid(this.width, this.height);
		this.tiles.fill(Tiles.Empty);
		this.tiles.fill_borders(Tiles.Wall);
		this.tiles.set(this.width-1, Math.random()*(this.height - 2) + 1 |0, Tiles.Empty);
		this.values = [];
		for (let i=0; i<max; ++i){
			this.values[i] = i;
		}
		this.tiles.foreach((val, x, y, tiles) => {
			if (val == Tiles.Empty){
				let conflicting = secondNeighbours.map(dp => tiles.get(x+dp[0], y+dp[1]));
				let possible = this.values.filter(v => !conflicting.includes(v));
				tiles.set(x, y, pick(possible));
			}
		});
		this.player = new Player();
		this.player.y = Math.random()*(this.height - 2) + 1 |0;
		this.tiles.set(0, this.player.y, Tiles.Empty);
	}
	
	move(x, y){
		this.player.x = x;
		this.player.y = y;
		this.tiles.set(x, y, Tiles.Empty);
		this.draw();
		if (x + 1 >= this.width){
			console.log("Congratulations");
			this.status = Status.Won;
			this.draw()
		}
	}
	
	update(n){
		if (this.status != Status.Playing){
			return;
		}
		for (let d of neighbours){
			let x = this.player.x + d[0];
			let y = this.player.y + d[1];
			if (this.tiles.get(x, y) == n){
				this.move(x, y);
				return;
			}
		}
		this.time -= 3;
		this.updateTime();
	}
	
	countDown(){
		if (this.status != Status.Playing){
			return;
		}
		--this.time;
		this.updateTime();
	}
	
	updateTime(){
		document.getElementById("timer").innerHTML = this.time;
		if (this.time <= 0){
			console.log("Game Over");
			this.status = Status.Lost;
			this.draw();
		}
	}
	
	draw(){
		var canvas = document.getElementById("output");
		var ctx = canvas.getContext("2d");
		canvas.width = this.width * this.tile_size;
		canvas.height = this.height * this.tile_size;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.strokeStyle = "#bbb";
		ctx.font = "20px sans-serif";
		this.tiles.foreach((val, x, y) => {
			ctx.strokeRect(x*this.tile_size, y*this.tile_size, this.tile_size, this.tile_size);
			if (x == this.player.x && y == this.player.y){
				ctx.fillStyle = "#000";
				ctx.fillText("@", (x+0.05)*this.tile_size, (y+0.75)*this.tile_size);
			}else if (val == Tiles.Wall){
				ctx.fillStyle = "#000";
				ctx.fillRect(x*this.tile_size, y*this.tile_size, this.tile_size, this.tile_size);
			} else if (val == Tiles.Empty) {
				ctx.fillStyle = "#888";
				ctx.fillRect(x*this.tile_size, y*this.tile_size, this.tile_size, this.tile_size);
			} else if (typeof val == "number") {
				ctx.fillStyle = "#000";
				ctx.fillText(val, (x+0.25)*this.tile_size, (y+0.8)*this.tile_size);
			}
		});
		if (this.status == Status.Won){
			ctx.fillStyle = "#00ff0044";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		} else if (this.status == Status.Lost){
			ctx.fillStyle = "#ff000044";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
	}
}

var world;
var interval;

function gv(id){
	return document.getElementById(id).value|0;
}

function restart(){
	clearInterval(interval);
	world = new World(gv("fieldwidth"), gv("fieldheight"), Math.min(gv("maxnumber")+1, 10), gv("timing"));
	world.draw();
	setInterval(()=>world.countDown(), 1000)
}


addEventListener("keydown", e => {
	if (validKeys.has(e.key)){
		world.update(validKeys.get(e.key));
		world.draw();
	}
});

addEventListener("load", restart);
