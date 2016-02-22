var Point = function(x, y) {
	this.x = parseFloat(x); 
	this.y = parseFloat(y);
};

Point.prototype.toString = function() {
	return "(" + this.x + ", " + this.y + ")";
};

Point.prototype.equals = function(point) {
	if(point instanceof Point)
		return Math.abs(this.x - point.x) <= 0.0000000001 && Math.abs(this.y - point.y) <= 0.0000000001;
	else
		return
};

var Polygon = function(vertices) {
	this.vertices = vertices;

	// compute min and max
	var allX = [];
	var allY = [];
	for(var i = 0; i < vertices.length; i++) {
		allX.push(vertices[i].x);
		allY.push(vertices[i].y);
	}

	this.minX = Math.min(...allX);
	this.minY = Math.min(...allY);
	this.maxX = Math.max(...allX);
	this.maxY = Math.max(...allY);
	this.rangeX = this.maxX - this.minX;
	this.rangeY = this.maxY - this.minY;

	// compute lines
	this.lines = [];
	for (var i = 0; i < vertices.length; i++) {
		if ( i == vertices.length - 1 ) {
			this.lines.push(new Line(vertices[i], vertices[0]));
			break;
		}
		this.lines.push(new Line(vertices[i], vertices[i+1]));
	}
};

Polygon.prototype.containsPoint = function(point) {
	var intersections = 0;
	var line = new Line(new Point(this.minX - 1, point.y), point);
	for(var index = 0 ; index < this.lines.length ; index++) {
		var side = this.lines[index];
		if( line.intersects(side) ) {
			if( side.pointA.y != point.y && side.pointB.y != point.y )
				intersections++;
			else
			{
				// intersection is vertex
				if( side.pointA.y == point.y && side.pointB.y < point.y )
					intersections++;
				if( side.pointB.y == point.y && side.pointA.y < point.y )
					intersections++;
			}
		}
	}
	return intersections % 2 == 1;
}

// Return [[Point]]
Polygon.prototype.findEars = function() {
	var ears = [];
	var vertices = this.vertices.slice();
	var index = 0;
	while(vertices.length >= 3) {
		var preVertex = vertices[(index - 1 + vertices.length) % vertices.length];
		var currentVertex = vertices[index % vertices.length];
		var nextVertex = vertices[(index + 1) % vertices.length];

		if(turnDirection(preVertex, currentVertex, nextVertex) == left)
		{
			// convex vertex (ear candidate)
			var potentialEar = new Polygon([preVertex, currentVertex, nextVertex]);
			var containsVertices = false;

			// check if "ear" contains other vertices of polygon
			for( var vertexIndex = 0 ; vertexIndex < this.vertices.length ; vertexIndex++ ) {
				var vertex = this.vertices[vertexIndex];
				if( vertex != currentVertex && vertex != preVertex && vertex != nextVertex ) {
					if( potentialEar.containsPoint(vertex) ) {
						containsVertices = true;
						break;
					}
				}
			}
 
			if(!containsVertices) {
				ears.push([this.vertices.indexOf(preVertex), this.vertices.indexOf(currentVertex), this.vertices.indexOf(nextVertex)]);
				vertices.splice(index % vertices.length, 1);
			}
		} 
		index++;
	}
	return ears;
}

Polygon.prototype.colorVertices = function() {
	if(this.vertices.length >= 3) {
		var ears = this.findEars();
		this.vertices[ears[ears.length - 1][0]].color = "r";
		this.vertices[ears[ears.length - 1][1]].color = "g";
		this.vertices[ears[ears.length - 1][2]].color = "b";
		for( var i = ears.length - 2 ; i >= 0 ; i-- ) {
			var unseenColors = "rgb";
			var vertexToAddColor ;
			for( var j = 0 ; j < 3 ; j++ ) {
				var currentColor =  this.vertices[ears[i][j]].color;
				if( typeof currentColor === 'undefined')
					vertexToAddColor = this.vertices[ears[i][j]];
				else
					unseenColors = unseenColors.replace(currentColor, "");
			}

			if(vertexToAddColor instanceof Point)
				vertexToAddColor.color = unseenColors;
		}
	}
}

Polygon.prototype.guardPositions = function() {
	this.colorVertices();

	var redVertices = this.vertices.filter(vertex => { return vertex.color == "r" });
	var greenVertices = this.vertices.filter(vertex => { return vertex.color == "g" });
	var blueVertices = this.vertices.filter(vertex => { return vertex.color == "b" });

	if(redVertices.length <= greenVertices.length && redVertices.length <= blueVertices.length)
		return redVertices;
	else if(greenVertices.length <= redVertices.length && greenVertices.length <= blueVertices.length)
		return greenVertices;
	else
		return blueVertices;
};

Polygon.prototype.printGuardPositions = function() {
	var guards = this.guardPositions();
	console.log("Guards are at " + guards[0].color);
	for(var index = 0 ; index < guards.length ; index++ )
		console.log("Guard at (" + guards[index].x + ", " + guards[index].y + ")");
};

// Return [CheckablePolygon]
var getPolygonAndGuards = function(file, callback) {
	var reader = new FileReader();
	reader.onload = function(event) {
		var lines = reader.result.split(/\r?\n/);
		var output = [];
		for(var index = 0 ; index < lines.length ; index++) {
			var string = lines[index];
			string = string.replace(/[^:]: /, "");


			var vertexString = string.match(/[^;]+/);
			var vertices = [];
			if(vertexString.length == 1)
				vertices = extractPoints(vertexString[0]);

			var guardString = string.match(/;.+/);
			var guards = [];
			if(typeof guardString === 'object' && guardString != null && guardString.length == 1)
				guards = extractPoints(guardString[0]);

			output.push({ polygon: new Polygon(vertices), guards: guards });
		};

		callback(output);
	};
	reader.readAsText(file);	
}

// Return [Point]
// Input: string containing comma-delimited 2-tuples of ints/floats
// e.g. "(2, 3), (4, 5), (0.5, -1.442)"
var extractPoints = function(string) {
	var pointStrings = string.match(/\([^\)]+\)/g);
	var points = [];
	for(var index = 0 ; index < pointStrings.length ; index++) {
		var pointString = pointStrings[index];
		var values = pointString.match(/-?\d+(\.\d+)?/g);
		points.push(new Point(values[0], values[1]));
	}
	return points;
}