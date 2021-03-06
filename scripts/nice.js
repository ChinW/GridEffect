var mouse = {
	x: 0
	, y: 0
	, down: false
}

window.requestAnimFrame = 
	window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAniamtionFrame ||
	window.msRequestAnimationFrame ||
	function (callback) {
		window.setTimeout(callback, 1000/60);
	};

window.cancelAnimFrame = 
	window.cancelAnimationFrame ||
	window.webkitCancelAnimationFrame ||
	window.mozCancelAnimationFrame ||
	window.msCancelAnimationFrame;

;(function(mouse){

// Canvas Setting
var canvas
	, ctx
	, width = 47
	, height = 15	
	, product = (width+1)*(height+1)
	, center = parseInt(product / 2)
	, interval = 30
	, waveConfig = {
		influence: 44
		, spreadSpeed : function(x){
			if(x == 0)
				return 2
			return 1/x
		}
	}
	, waves
	, startX 
	, startY
	, endX
	, endY
	, delay = 0
	, bufferCount = 0
	, once = 10000
	, random = {
		r: 0, 
		r_direction: 1,
		g: 0,
		g_direction: 1,
		b: 0,
		b_direction: 1
	}
	;

//Muisc settings
var player;

function getRandomInt(min, max){
	return Math.floor(Math.random() * (max - min))+min
}


/**
 * Point
 */

var Point = function(x, y){
	this.x = x
	this.y = y

	this.px = x // previous x
	this.py = y // previous y

	this.ox = x // original x
	this.oy = y // original y

	this.vx = 0 
	this.vy = 0

	this.state = 0 //0 for spread,1 for shrink
	this.constraints = []
}

Point.prototype.update = function(){
	if(mouse.x != 0 && mouse.down){
		var diff_x = this.x - mouse.x
			, diff_y = this.y - mouse.y
			, dist = Math.sqrt(diff_x * diff_x + diff_y * diff_y)

		// if(this.ox == 682.5 && this.oy == 200)
		// 	debugger;

		if(dist < waveConfig.influence ){
			var delta = (this.x - this.px)== 0 ? this.y - this.py: this.x - this.px
			delta = waveConfig.spreadSpeed(Math.abs(delta))

			this.px = this.x
			this.py = this.y
			if(this.vx == 0 && this.vy == 0){
				if(dist == 0){
					this.vx = getRandomInt(0, interval/5)
					this.vy = getRandomInt(0, interval/5)
				}else{
					this.vx = diff_x / dist * delta
					this.vy = diff_y / dist * delta
				}
			}

			this.x = this.x + this.vx
			this.y =  this.y + this.vy

			// console.log("this.ox,oy is ("+this.ox+","+this.oy+"), delta :("+delta+"), px,py ("+this.px+","+this.py+"), x,y ("+this.x+","+this.y+")")
		}
	}

	var i = this.constraints.length
	while(i--)
		this.constraints[i].update()
	this.x += this.vx
	this.y += this.vy
	//restore point state
	if(this.vx == 0 && this.vy == 0){
		if(this.x != this.ox || this.y != this.oy){
			var diff_x = this.ox - this.x
				, diff_y = this.oy - this.y
				// , dist = Math.sqrt(diff_x * diff_x + diff_y*diff_y)

			// debugger;
			
			// this.vx = diff_x / dist 
			// this.vy = diff_y / dist

			this.x += diff_x * 0.05
			this.y += diff_y * 0.05
			// this.x += dist / diff_x *0.00000015
			// this.y += dist / diff_y*0.00000015
			
			// if(this.ox == 703 && this.oy == 220){
			// 	// console.log(dist / diff_x *0.00000015, dist / diff_y*0.00000015)
			// 	console.log(diff_x/dist, diff_y/dist)
			// 	debugger;
			// }
		}
	}
	
	// this.x += this.vx
	// this.y += this.vy
	
	this.x < startX  ? this.x = startX : (this.x>endX && (this.x = endX))
	this.y < startY ? this.y = startY : (this.y>endY && (this.y = endY))
}

Point.prototype.draw = function(){
	var i = this.constraints.length
	while(i--){
		this.constraints[i].draw()
	}
}

Point.prototype.fill = function(index){
	ctx.moveTo(this.x, this.y)
	var p = waves.points[index-1]
	ctx.lineTo(p.x, p.y)
	p = waves.points[index-2-width]
	ctx.lineTo(p.x, p.y)
	p = waves.points[index-width-1]
	ctx.lineTo(p.x, p.y)
	ctx.lineTo(this.x, this.y)

}

/**
 * Constraint
 */

var Constraint = function (p1, p2){
	this.p1 = p1
	this.p2 = p2

	this.length = interval

}

//处理约束
Constraint.prototype.update = function(){	
	//如果是边界，返回
	if(this.p2.x <= startX || this.p2.y <= startY || this.p2.x>= endX || this.p2.y >= endY){
		this.p1.vx = this.p1.vy = this.p2.vx = this.p2.vy = 0
		return;
	}
	var diff_x = this.p2.x - this.p1.x
		, diff_y = this.p2.y - this.p1.y
		, dist = Math.sqrt(diff_x * diff_x + diff_y * diff_y)
		// , diff = (this.length - dist)/ dist

	var p1_diff_x = this.p1.x - mouse.x
		, p1_diff_y = this.p1.y - mouse.y
		, p1_dist = Math.sqrt(p1_diff_x * p1_diff_x + p1_diff_y * p1_diff_y)

	var p2_diff_x = this.p2.x - mouse.x
		, p2_diff_y = this.p2.y - mouse.y
		, p2_dist = Math.sqrt(p2_diff_x * p2_diff_x + p2_diff_y * p2_diff_y)
	// if(this.p1.ox == 642.5 && this.p1.oy==100){
			// debugger;
		// }
	if(dist < interval && mouse.down ){
		// debugger;
		var px = diff_x / dist * 0.5
			, py = diff_y / dist * 0.5
		if(this.p1.x > mouse.x || this.p1.y > mouse.y){
			waves.drops.push(new Point(this.p1.x,this.p1.y))
		}else{
			waves.drops.push(new Point(this.p2.x,this.p2.y))
		}	

		var delta = 5.5

		if(this.p1.vx  == 0 && this.p1.vy == 0){
			this.p1.vx = p1_diff_x/p1_dist *delta
			this.p1.vy = p1_diff_y/p1_dist *delta
		}else{
			this.p1.vx *= 0.95
			this.p1.vy *= 0.95
		}
		if(this.p2.vx  == 0 && this.p2.vy == 0){
			this.p2.vx = p2_diff_x/p2_dist *delta
			this.p2.vy = p2_diff_y/p2_dist *delta
		}else{
			this.p2.vx *= 0.95
			this.p2.vy *= 0.95
		}

		this.p1.x += this.p1.vx
		this.p1.y += this.p1.vy

		this.p2.x += this.p2.vx
		this.p2.y += this.p2.vy

		// this.p1.x += p1_diff_x/p1_dist *delta
		// this.p1.y += p1_diff_y/p1_dist *delta

		// this.p2.x += p2_diff_x/p2_dist *delta
		// this.p2.y += p2_diff_y/p2_dist *delta

		
		// var delta = 2.5

		// var p1_nx = (this.p1.px - this.p1.x) * delta * p1_diff_x / p1_dist
		// 	, p1_ny = (this.p1.py - this.p1.y) * delta * p1_diff_y / p1_dist
		// 	, p2_nx = (this.p2.px - this.p2.x) * delta * p2_diff_x / p2_dist
		// 	, p2_ny = (this.p2.py - this.p2.y) * delta * p2_diff_y / p2_dist
		// 	; 

		// this.p1.px = this.p1.x
		// this.p1.py = this.p1.y

		// this.p2.px = this.p2.x
		// this.p2.py = this.p2.y

		// this.p1.x += p1_nx
		// this.p1.y += p1_ny

		// this.p2.x += p2_nx
		// this.p2.y += p2_ny
		
		// console.log("p1:(x,y)="+this.p1.x+","+this.p1.y+" (px,py)="+this.p1.px+","+this.p1.py)

		// debugger;
		// this.p1.x += diff_mx/dist_m *0.5
		// this.p1.y += diff_my/dist_m*0.5
		// this.p2.x -= diff_mx/dist_m *0.5
		// this.p2.y -= diff_my/dist_m * 0.5
		// this.p1.x -= px
		// this.p1.y -= py
		// this.p2.x += px
		// this.p2.y += py
		// this.p2.x -= px
		// this.p2.y -= py
	}else{
		this.p1.vx = this.p1.vy = this.p2.vx = this.p2.vy = 0
	}
}

Constraint.prototype.draw = function(){
	ctx.moveTo(this.p1.x, this.p1.y)
	ctx.lineTo(this.p2.x, this.p2.y)
}

/**
 * Wave
 */

var Wave = function(){
	this.points = []

	this.drops = []
	// this.points = [center]
	// this.points.push(new Point(0,0))
}

Wave.prototype.removePoints = function(points){
	console.log("Remove Points Index:",this.points.indexOf(points))
	this.points.splice(this.points.indexOf(points), 1)
}

Wave.prototype.update = function(){
	var j = this.drops.length
	if(j>1){
		this.drops.splice(1,j-1)
	}
	var i = this.points.length
	while(i--)
		this.points[i].update()
}

Wave.prototype.draw = function(){
	ctx.beginPath()
	var i = this.points.length
	while(i--){
		this.points[i].draw()
	}
	ctx.strokeStyle = "RGBA(10, 98, 195, 1)"
	ctx.stroke()

	i = this.points.length
	if(bufferCount  == 0){
		if((random.r + random.r_direction )% 135  == 0)
			random.r_direction = -random.r_direction
		random.r  = (random.r + random.r_direction )% 135

		if((random.g + random.g_direction )% 185  == 0)
			random.g_direction = -random.g_direction
		random.g  = (random.g + random.g_direction )% 185

		if((random.b + random.b_direction )% 185  == 0)
			random.b_direction = -random.b_direction
		random.b  = (random.b + random.b_direction )% 185 
	}
	// debugger
	while(i--){
		ctx.beginPath()
		ctx.fillStyle = "RGBA("+((random.r+Math.abs(i-center) /height))+", "+((random.g+Math.abs(i-center)*10 /height))+",  "+((random.b+Math.abs(i-center)* 8 /height))+", 1)"
		// console.log("RGBA("+((10+Math.abs(i-center)*98/product))+", "+((98+Math.abs(i-center)*209/product))+",  "+((120+Math.abs(i-center)/product))+", 0.7)")
		
			// debugger;
		if(i % (width+1) == 0 || i <= width)
			continue;
		this.points[i].fill(i)
		ctx.fill()
	}

	// ctx.restore()


	// Draw Drops
	// i = this.drops.length
	// ctx.fillStyle = "red"
	// while(i--){
		// ctx.moveTo(this.drops[i].x, this.drops[i].y)
		// ctx.arc(this.drops[i].x, this.drops[i].y,3,0, Math.PI*2,true)
		// ctx.lineTo(this.drops[i].x, this.drops[i].y)
	// }
	// ctx.fill()
}

function update(){
	ctx.clearRect(0,0, canvas.width, canvas.height)

	if(Math.random() > 0 && mouse.x == 0){

		mouse.x = canvas.width/2
		mouse.y = height*interval/2

		waves.drops.push(new Point(mouse.x, mouse.y))
		console.log("Droped",mouse.x, mouse.y)
		// waves.drop(mouse.x, mouse.y)
	}
	// if(once > 0){
		waves.update()
		// once--
	// }
	bufferCount = (bufferCount + 1)% 5
	waves.draw()

	requestAnimFrame(update)
}

function start(){
	startX = window.innerWidth/2 - (width*interval)/2 
	startY = 0

	endX = startX + interval * width
	endY = startY + interval * height
 	var pos = document.getElementById("pos")

	// canvas.onmousedown = function(e){
	// 	mouse.down = true
		// mouse.x = e.layerX
		// mouse.y = e.layerY
	// }

    // canvas.onmouseup = function(e){
    // 	mouse.down = false
    // }

    // window.onkeydown = function(e){
    // 	if(e.keyCode == 13){
    // 		once++
    // 	}
    // }

	waves = new Wave()
	for(var y = 0; y <= height; y++){
		for(var x = 0; x<= width; x++){
			var p = new Point(startX+ x*interval, startY+y*interval)

			x > 0 && p.constraints.push(new Constraint(p, waves.points[waves.points.length -1 ]))
			y > 0 && p.constraints.push(new Constraint(p, waves.points[x + (width+1)*(y-1)])) 

			waves.points.push(p)
		}
	}

	random.r = getRandomInt(10, 135)
	random.g = getRandomInt(70,185)
	random.b = getRandomInt(100,185)

	console.log(center)

	update()

}


function load(){
	canvas = document.getElementById("c");

	canvas.width = window.innerWidth ;
	canvas.height = window.innerHeight ;

	width = Math.ceil(canvas.width / interval)
	height = Math.ceil(canvas.height / interval)
	product = (width)*(height)
	center = parseInt(product / 2)
	// console.log(width, height)

	ctx = canvas.getContext("2d");
	if(ctx == false){
		alert("cannot get canvas context");
	}

	start()
}

window.addEventListener("load",load);
})(mouse)