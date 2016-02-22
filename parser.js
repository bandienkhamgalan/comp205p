var Point = function(x, y) {
	this.x = parseFloat(x); 
	this.y = parseFloat(y);
};

Point.prototype.toString = function() {
	return "(" + this.x + ", " + this.y + ")";
}

Point.prototype.equals = function(point) {
	if(point instanceof Point)
		return Math.abs(this.x - point.x) <= 0.0000000001 && Math.abs(this.y - point.y) <= 0.0000000001;
	else
		return
}

var CheckablePolygon = function(vertices, guards) {
	this.vertices = vertices.slice();
	this.guards = guards.slice();
}

// Return [CheckablePolygon]
var getPolygonAndGuards = function(file, callback) {
	var reader = new FileReader();
	reader.onload = function(event) {
		var lines = reader.result.split(/\r?\n/);
		var polygons = [];
		for(var index = 0 ; index < lines.length ; index++) {
			var string = lines[index];
			string = string.replace(/[^:]: /, "");


			var vertexString = string.match(/[^;]+/);
			var vertices = [];
			if(vertexString.length == 1)
				vertices = extractPoints(vertexString[0]);

			var guardString = string.match(/;.+/);
			console.log(guardString);
			var guards = [];
			if(typeof guardString === 'object' && guardString != null && guardString.length == 1)
				guards = extractPoints(guardString[0]);

			polygons.push(new CheckablePolygon(vertices, guards));
		};

		callback(polygons);
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