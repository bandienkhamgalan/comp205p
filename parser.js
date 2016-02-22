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
	for(var i = 0; i < points.length; i++) {
		allX.push(points[i].x);
		allY.push(points[i].y);
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
		if ( i == numberOfVertices - 1 ) {
			lines.push(new Line(vertices[i], vertices[0]));
			break;
		}
		lines.push(new Line(vertices[i], vertices[i+1]));
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

			polygons.push({ polygon: new Polygon(vertices), guards: guards });
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