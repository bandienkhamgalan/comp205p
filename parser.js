var Coordinate = function(x, y) {
	this.x = x; 
	this.y = y;
};

var CheckablePolygon = function(vertices, guards) {
	this.vertices = vertices;
	this.guards = guards;
}

// Return [CheckablePolygon]
var getPolygonAndGuards = function(file, callback) {
	var reader = new FileReader();
	reader.onload = function(event) {
		var lines = reader.result.split(/\r?\n/);
		var polygons = [];
		for(var polygon = 0 ; polygon < lines.length ; polygon++) {
			var line = lines[i];
			line.replace(/\d+: /, "");
			var vertices = [];
			var vertexCoordinates = line.match(/\([^\)]+\)/g);
			for(var j = 0 ; j < vertexCoordinates.length ; j++) {
				var coordinateString = vertexCoordinates[j];
				var points = coordinateString.match(/-?\d+(\.\d+)?/g);
				vertices.push(Coordinate(points[0], points[1]));
			}
		};
	};
	reader.readAsText(file);	
}