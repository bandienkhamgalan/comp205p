var pago, scaleFactor = 1, unit;
var panX, panY;
var triangles, visibilityPolygons;
var mouseX, mouseY, clicked;

var resolutionMultiplier = 2;

function initCanvas() {
	var canvas = document.getElementById("myCanvas");

	var width = window.innerWidth - 10 - 250;
	var height = window.innerHeight - 10; 
	canvas.width = resolutionMultiplier * width;
	canvas.height = resolutionMultiplier * height;
	canvas.style.width = width;
	canvas.style.height = height;

	canvas.addEventListener("mousemove", function(event) {
		var rect = canvas.getBoundingClientRect();
		var x = (event.clientX - rect.left) / scaleFactor * resolutionMultiplier;
		var y = (event.clientY - rect.top) / -scaleFactor * resolutionMultiplier;
		x = (x - panX);
		y = (y - panY);
		if(clicked) {
			panX += (x - mouseX);
			panY += (y - mouseY);
			redraw();
		}
		else {
			var mapId = parseInt(document.getElementById("mapId").value) - 1;
			document.getElementById("mouseCoordinates").innerHTML = "Mouse at (" + x.toFixed(3) + ", " + y.toFixed(3) + ")";
			document.getElementById("mouseCoordinates").innerHTML += pago[mapId].polygon.containsPoint(new Point(x, y), true) ? " inside" : " outside";
		}
	});

	canvas.addEventListener('mousewheel', function(event) {
		event.preventDefault();
		var delta = event.wheelDelta ? event.wheelDelta / 40 : event.detail ? -event.detail : 0;

		

		/*var rect = canvas.getBoundingClientRect();
		var x = event.clientX - rect.left;
		var y = event.clientY - rect.top;
		panX *= Math.pow(1.0025, delta) * (x * resolutionMultiplier / canvas.width);
		panY *= Math.pow(1.0025, delta) * (y * resolutionMultiplier / canvas.height); */
		scaleFactor *= Math.pow(1.025, delta);
		unit = 0.0025 * 200 / scaleFactor;
		redraw();
	});

	canvas.addEventListener('mousedown', function(event) {
		var rect = canvas.getBoundingClientRect();
		var x = (event.clientX - rect.left) / scaleFactor * resolutionMultiplier;
		var y = (event.clientY - rect.top) / -scaleFactor * resolutionMultiplier;
		x = (x - panX);
		y = (y - panY);
		clicked = true;
		mouseX = x;
		mouseY = y;
	});

	canvas.addEventListener('mouseup', function(event) {
		clicked = false;
	});

	canvas.addEventListener('mouseout', function(event) {
		clicked = false;
	});
}

function newFile(file) {
	getPolygonAndGuards(file, function(pag) {
		pago = pag;
		recompute();
		redraw();
	});
}

function removeAllGuards() {
	var mapId = parseInt(document.getElementById("mapId").value) - 1;
	pago[mapId].guards = [];
	visibilityPolygons = [];
	redraw();
}

function recompute() {
	var mapId = parseInt(document.getElementById("mapId").value) - 1;
	var polygon = pago[mapId].polygon;
	var guards = pago[mapId].guards;
	visibilityPolygons = fullVisibilityPolygon(polygon, guards);
	var scaleFactorX = document.getElementById("myCanvas").width / (1.05 * polygon.rangeX);
	var scaleFactorY = document.getElementById("myCanvas").height / (1.05 * polygon.rangeY);
	scaleFactor = Math.min(scaleFactorX, scaleFactorY);
	panX = -polygon.minX + 0.025 * polygon.rangeX;
	panY = -polygon.minY - polygon.rangeY - (0.025 * polygon.rangeY);
	unit = 0.005 * 200 / scaleFactor;
}

function redraw() {
	if(document.getElementById("draw").checked) {
		var canvas = document.getElementById("myCanvas");
		var c = canvas.getContext('2d');

		var mapId = parseInt(document.getElementById("mapId").value) - 1;
		c.setTransform(1,0,0,1,0,0);
		c.clearRect(0,0, canvas.width, canvas.height);
		scaleCanvas(c);

		console.log(pago[mapId].guards.length + " guards for polygon with " + pago[mapId].polygon.vertices.length + " vertices");

		drawPolygon(c, pago[mapId].polygon);

		drawVisibilityPolygons(c, pago[mapId].polygon, pago[mapId].guards);

		drawInvisibleAreas(c, pago[mapId].polygon);

		// draw origin
		c.fillStyle = 'yellow';
		c.beginPath();
		c.arc(0,0,6 * unit,0,2*Math.PI);
		c.fill();
	}
}

function drawVisibilityPolygons(c, polygon, guards) {
	var guardId = document.getElementById("guardId").value;
	if (guardId < 0) {
		for( var index = 0 ; index < visibilityPolygons.length ; index++ ) 
			drawPolygon(c, visibilityPolygons[index], "rgba(0, 0, 255, 0.25)");
		drawGuardPoints(c, guards);
	} else if(guardId < guards.length) {
		drawPolygon(c, visibilityPolygons[guardId], "rgba(0, 0, 255, 0.25)");
		drawGuardPoints(c, [guards[guardId]]);
	} 
};

function drawInvisibleAreas(c, polygon) {
	// draw nonVisibleAreas
	var nonVisibleAreas = polygon.nonVisibleAreas(visibilityPolygons);
	for( var index = 0 ; index < nonVisibleAreas.length ; index++ )
		drawPolygon(c, nonVisibleAreas[index], "firebrick");

	console.log("Checking if entire polygon is visible by guards...");
	if( nonVisibleAreas.length > 0 ) {
		// plot & log point in non visible area
		nonVisiblePoint = nonVisibleAreas[0].pointInPolygon();
		
		console.log("Not all areas visible. Non-visible point: " + nonVisiblePoint)
		console.log(nonVisiblePoint);
		c.fillStyle = 'lawngreen';
		c.beginPath();
		c.arc(nonVisiblePoint.x, nonVisiblePoint.y, 20 * unit, 0, 2 * Math.PI);
		c.fill();
	}
	else
		console.log("All areas visible. ");
}

function scaleCanvas(c) {
	c.scale(scaleFactor, -scaleFactor);
	c.translate(panX, panY);
}

function drawPolygon(c, polygon) {
	var points = polygon.vertices;
	c.fillStyle = arguments.length == 3 ? arguments[2] : 'white';
	c.beginPath();
	c.moveTo(points[0].x, points[0].y);
	var i = 1;
	for(i = 1; i < points.length; i++) {
		c.lineTo(points[i].x, points[i].y);
	}
	c.lineTo(points[0].x, points[0].y);
	c.closePath();
	c.fill();  
}

function drawColoredVertices(c, polygon) {
	for(var index = 0 ; index < polygon.vertices.length ; index++) {
		var vertex = polygon.vertices[index];
		c.fillStyle = vertex.color == "r" ? "red" : vertex.color == "g" ? "green" : "blue";
		c.beginPath();
		c.arc(vertex.x,vertex.y, 15 * unit, 0, 2 * Math.PI);
		c.fill();
	}
}

function drawGuardPoints(c, points) {
	c.fillStyle = 'black';
	for(var i = 0; i < points.length; i++) {
		c.beginPath();
		c.arc(points[i].x,points[i].y, 20 * unit, 0,2 * Math.PI);
		c.fill();
	}
}

function computeGuards() {
	var mapId = parseInt(document.getElementById("mapId").value) - 1;
	pago[mapId].guards = pago[mapId].polygon.guardPositions();
	console.log(pago[mapId].guards.length + " guards found");
	document.getElementById("guardId").value = -1;
	recompute();
	redraw();
}

function findRefutationPoints() {
	var output = "xerus\ngsfgscj4pdedl7v2jv395a86eh\n";
	for(var i = 0 ; i < pago.length ; i++) {
		var polygon = pago[i].polygon;
		var guards = pago[i].guards;
		currentVisibilityPolygons = fullVisibilityPolygon(polygon, guards);
		var nonVisibleAreas = polygon.nonVisibleAreas(currentVisibilityPolygons);

		if(nonVisibleAreas.length > 0) {
			// plot & log point in non visible area
			nonVisiblePoint = nonVisibleAreas[0].pointInPolygon();
			console.log((i + 1) + ": " + nonVisiblePoint + "\n");
			output += (i + 1) + ": " + nonVisiblePoint + "\n";
		}
	}
	
	console.log(output);
	var download = "data:application/octet-stream;filename=output.txt," + encodeURIComponent(output);
	var newWindow = window.open(download, 'output.txt');
}

function removeRedundantGuardsClicked(mode) {
	var mapId = parseInt(document.getElementById("mapId").value) - 1; 
	removeRedundantGuards(pago[mapId].polygon, pago[mapId].guards, visibilityPolygons, mode);
	redraw();
}

function removeDuplicates(guards, visibilities) {
	for(var i = 0 ; i < guards.length ; i++) {
		var j = i + 1;
		while(j < guards.length) {
			if(guards[j].equals(guards[i])) {
				guards.splice(j, 1);
				if(typeof visibilites === 'object')
					visibilities.splice(j, 1);
			} else {
				j++;
			}
		}
	}
}

function addColorGuards() {
	var mapId = parseInt(document.getElementById("mapId").value) - 1;
	pago[mapId].guards.push(...pago[mapId].polygon.colorGuards());
	visibilityPolygons = fullVisibilityPolygon(pago[mapId].polygon, pago[mapId].guards);
	removeDuplicates(pago[mapId].guards, visibilityPolygons);
	redraw();
}

function addVertexGuards() {
	var mapId = parseInt(document.getElementById("mapId").value) - 1;
	pago[mapId].guards.push(...pago[mapId].polygon.vertices.slice());
	visibilityPolygons = fullVisibilityPolygon(pago[mapId].polygon, pago[mapId].guards);
	removeDuplicates(pago[mapId].guards, visibilityPolygons);
	redraw();
}

function addRayGuards() {
	var mapId = parseInt(document.getElementById("mapId").value) - 1;
	pago[mapId].guards.push(...pago[mapId].polygon.visibilityExtensions("intersections"));
	visibilityPolygons = fullVisibilityPolygon(pago[mapId].polygon, pago[mapId].guards);
	removeDuplicates(pago[mapId].guards, visibilityPolygons);
	redraw();
}

function addRayMidpointGuards() {
	var mapId = parseInt(document.getElementById("mapId").value) - 1;
	pago[mapId].guards.push(...pago[mapId].polygon.visibilityExtensions("midpoint"));
	visibilityPolygons = fullVisibilityPolygon(pago[mapId].polygon, pago[mapId].guards);
	removeDuplicates(pago[mapId].guards, visibilityPolygons);
	redraw();
}	

function greedySelection(mode) {
	var mapId = parseInt(document.getElementById("mapId").value) - 1; 
	var update = greedilySelectGuards(pago[mapId].polygon, pago[mapId].guards, visibilityPolygons, mode);
	pago[mapId].guards = update.guards;
	visibilityPolygons = update.visibilityPolygons;
	redraw();
}

function greedySelectionProbabilistic(mode) {
	var mapId = parseInt(document.getElementById("mapId").value) - 1; 
	var update = greedilySelectGuardsProbabilistic(pago[mapId].polygon, pago[mapId].guards, visibilityPolygons, mode);
	pago[mapId].guards = update.guards;
	visibilityPolygons = update.visibilityPolygons;
	redraw();
}