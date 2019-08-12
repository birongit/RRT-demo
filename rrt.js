function randFloat(size) {
	return Math.random() * size;
}

function randInt(size) {
	return Math.floor(Math.random() * (size + 1));
}

function randIntBase(size, base) {
	return randInt(size / base) * base;
}

// TODO: tests when det === 0
function intersects(a, b, c, d, p, q, r, s) {
 	var det, gamma, lambda;
 	det = (c - a) * (s - q) - (r - p) * (d - b);
 	if (det === 0) {
    	return false;
  	} else {
    	lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    	gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    	return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
 	}
}

function checkCollision(p1, p2, obstacle) {
	for (i = 0; i < obstacles.length / 2; i++) {
		if (intersects(p1[0], p1[1], p2[0], p2[1],
			obstacle[2 * i][0], obstacle[2 * i][1],
			obstacle[2 * i + 1][0], obstacle[2 * i + 1][1])) {
				return true;
		}	
	}
	return false;
}

function drawDot(position, style) {
	cx.beginPath();
	cx.arc(position[0], position[1], 5, 0, 2 * Math.PI);
	cx.fillStyle = style;
	cx.fill();
}

function drawLine(start, end, style, width = 2) {
	cx.beginPath();
	cx.moveTo(start[0], start[1]);
	cx.lineTo(end[0], end[1]);
	cx.strokeStyle = style;
	cx.lineWidth = width;
	cx.stroke();
}

// Get context for canvas
let canvas = document.querySelector("canvas");
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
let cx = canvas.getContext("2d");

// Global variables
const maxTreesize = 3000;
let tree = d3.quadtree();
let obstacles = [];
let start = [];
let goal = [];
let found = false;
let req;

function init() {
	// Start of tree
	start = [randFloat(canvasWidth), randFloat(canvasHeight)];
	drawDot(start, "red");
	tree.add(start);

	// Sample obstacles
	const obstacleSize = 10;
	const unit = 25;
	for (i = 0; i < obstacleSize; i++) {
		obstacles.push([randIntBase(canvasWidth, unit), randIntBase(canvasHeight, unit)]);
		if (randFloat(1) > 0.5) {
			obstacles.push([obstacles[2 * i][0], randIntBase(canvasHeight, unit)]);
		} else {
			obstacles.push([randIntBase(canvasWidth, unit), obstacles[2 * i][1]]);
		}
	}
	for (i = 0; i < obstacleSize; i++) {
		drawLine(obstacles[2 * i], obstacles[2 * i + 1], "blue");
	}

	// Sample goal
	goal = [randFloat(canvasWidth), randFloat(canvasHeight)];
	drawDot(goal, "green");
	if (!checkCollision(start, goal, obstacles)) {
		drawLine(start, goal, "green");
		found = true;
		return;
	}
}

function run() {
	init();
	if (found === false) {
		req = window.requestAnimationFrame(explore);
	}
}

function explore() {
	const iterSize = Math.min(Math.ceil(tree.size()/100), 8);
	for (i = 0; i < iterSize; i++) {
		if (tree.size() >= maxTreesize) {
			return;
		}
		// Sample new point
		var point = [randFloat(canvasWidth), randFloat(canvasHeight)];
		// Get nearest from quadtree
		var nearest = tree.find(point[0], point[1]);
		if (!checkCollision(point, nearest, obstacles)) {
			// Add point to tree
			// TODO: Append with additional data of parent point to reconstruct path like so
			// p = [point[0], point[1], nearest[0], nearest[1]]
			tree.add(point);
			// Connect points (draw path)
			drawLine(nearest, point, "black");

			if (!checkCollision(point, goal, obstacles)) {
				drawLine(goal, point, "green");
				found = true;
				return;
			}
		}
	}
	req = window.requestAnimationFrame(explore);
}

function restart() {
	cancelAnimationFrame(req);
	cx.clearRect(0, 0, canvasWidth, canvasHeight);
	tree = d3.quadtree();
	obstacles = [];
	start = [];
	goal = [];
	found = false;
	run();
}

run();