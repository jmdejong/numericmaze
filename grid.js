"use strict";

class Grid {
	
	constructor(width, height){
		this.width = width;
		this.height = height;
		this.cells = [];
	}
	
	set(x, y, value){
		this.cells[x + y * this.width] = value;
	}
	
	get(x, y){
		return this.cells[x + y*this.width]
	}
	
	fill(value){
		for (let i=0; i<this.width*this.height; ++i){
			this.cells[i] = value;
		}
	}
	
	foreach(callback){
		for (let x=0; x<this.width; ++x){
			for (let y=0; y<this.height; ++y){
				callback(this.get(x, y), x, y, this);
			}
		}
	}
	
	fill_borders(value){
		for (let x=0; x<this.width; ++x){
			this.set(x, 0, value);
			this.set(x, this.height-1, value);
		}
		for (let y=0; y<this.height; ++y){
			this.set(0, y, value);
			this.set(this.width-1, y, value);
		}
	}
}
