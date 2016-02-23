var Point = function(x, y) {
	this.x = parseFloat(x); 
	this.y = parseFloat(y);
};

Point.prototype.toString = function() {
	return "(" + this.x + ", " + this.y + ")";
};

Point.prototype.equals = function(point) {
	if(point instanceof Point)
		return equals(this.x, point.x) && equals(this.y, point.y);
	else
		return
};

var epsilon = 0.0000000001;

var equals = function(a, b) {
	return Math.abs(a - b) < epsilon;
}

var greaterThan = function(a, b) {
	return a - b >= epsilon;
}

var greaterThanOrEqualTo = function(a, b) {
	return greaterThan(a, b) || equals(a, b);
}

var lessThan = function(a, b) {
	return b - a >= epsilon;
}

var lessThanOrEqualTo = function(a, b) {
	return lessThan(a, b) || equals(a, b);
}

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

// boundary does not count
Polygon.prototype.containsPoint = function(point, boundariesIncluded) {
	var intersections = 0;
	var line = new Line(new Point(this.minX - 1, point.y), point);
	for(var index = 0 ; index < this.lines.length ; index++) {
		var side = this.lines[index];
		if( side.containsPoint(point) )
			return boundariesIncluded;

		if( line.intersects(side) ) {
			if( side.pointA.y != point.y && side.pointB.y != point.y ) // regular intersection
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

Polygon.prototype.containsPolygon = function(polygon) {
	for(var index = 0 ; index < polygon.vertices.length ; index++) {
		var polygonVertex = polygon.vertices[index];
		if(!this.containsPoint(polygonVertex, true)) {
			return false;
		}
	}

	for(var i = 0 ; i < this.lines.length ; i++) {
		var thisLine = this.lines[i];
		for( var j = 0 ; j < polygon.lines.length ; j++ ) {
			var polygonLine = polygon.lines[j];
			if(thisLine.intersectsNotColinearNotVertex(polygonLine)) {
				return false;
			}
		}
	}

	return true;
}

var DoublyLinkedCycle = function(value) {
	this.value = value;
	this.next = this;
	this.previous = this;
}

DoublyLinkedCycle.prototype.insertAfter = function(value) {
	var node = new DoublyLinkedCycle(value);
	var oldNext = this.next;
	this.next = node;
	node.previous = this;
	node.next = oldNext;
	oldNext.previous = node;
}

DoublyLinkedCycle.prototype.delete = function() {
	this.previous.next = this.next;
	this.next.previous = this.previous;
}

// returns new DoublyLinkedCycle or null on empty/undefined input list
DoublyLinkedCycle.fromArray = function(list) {
	if(typeof list === 'object' && list.length > 0)
	{
		var toReturn = new DoublyLinkedCycle(list[0]);
		var current = toReturn;
		for( var index = 1 ; index < list.length ; index++ )
		{
			current.insertAfter(list[index]);
			current = current.next;
		}
		return toReturn;
	}
	return null;
};

DoublyLinkedCycle.prototype.print = function() {
	var currentNode = this;
	do {
		console.log(currentNode.value);
		currentNode = currentNode.next;
	} while(currentNode != this);
}

// Return [[Point]]
Polygon.prototype.findEars = function() {
	var ears = [];
	var index = 0;
	var currentNode = DoublyLinkedCycle.fromArray(this.vertices);
	vertices = this.vertices.length;
	while(vertices >= 3) {
		var currentVertex = currentNode.value;
		var previousVertex = currentNode.previous.value;
		var nextVertex = currentNode.next.value;

		if(turnDirection(previousVertex, currentVertex, nextVertex) == left)
		{
			// convex vertex (ear candidate)
			var potentialEar = new Polygon([previousVertex, currentVertex, nextVertex]);
			var containsVertices = false;

			// check if "ear" contains other vertices in linked list
			var node = currentNode.next.next;
			while( node != currentNode.previous )
			{
				var vertex = node.value;
				if( vertex != currentVertex && vertex != previousVertex && vertex != nextVertex ) {
					if( potentialEar.containsPoint(vertex, true) ) {
						containsVertices = true;
						break;
					}
				}
				node = node.next;
			}
 
			if(!containsVertices) {
				ears.push([this.vertices.indexOf(previousVertex), this.vertices.indexOf(currentVertex), this.vertices.indexOf(nextVertex)]);
				var previousNode = currentNode.previous;
				var nextNode = currentNode.next;
				currentNode.delete();
				currentNode = currentNode.next;
				vertices--;
			}
		}
		currentNode = currentNode.next;
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