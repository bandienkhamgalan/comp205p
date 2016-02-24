/* Iteration 1 – color triangulations and find minimum set */

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

var shuffleInSync = function(a, b) {
	for( var index = 0 ; index < a.length ; index++ ) {
		var indexToSwap = parseInt(Math.random() * (a.length - index) + index);
		var temp = a[index];
		a[index] = a[indexToSwap];
		a[indexToSwap] = temp;

		temp= b[index];
		b[index] = b[indexToSwap];
		b[indexToSwap] = temp;
	}
}

/* Iteration 2 – Remove redundant guards */

// make sure guards and visibilityPolygons are in sync
// performs removal in place on guards and visibilityPolygons
function removeRedundantGuards(polygon, guards, visibilityPolygons) {
	shuffleInSync(guards, visibilityPolygons);

	var polygonArea = polygon.area();
	var length = guards.length;
	var count = 0;
	while(count < length) {
		console.log("Considering guard at " + guards[0]);
		var guard = guards.splice(0, 1)[0];
		var visibilityPolygon = visibilityPolygons.splice(0, 1)[0];
		count++;

		// check if removing guard makes a polygon vertex non visible
		console.log("Checking if removing guard makes a polygon vertex non visible");
		var allVerticesFound = true;
		for(var i = 0 ; i < polygon.vertices.length ; i++ ) {
			var searchVertex = polygon.vertices[i];
			var vertexFound = false;
			for(var j = 0 ; j < visibilityPolygons.length ; j++ ) {
				if(visibilityPolygons[j].vertices.filter(vertex => {return vertex.equals(searchVertex)}).length > 0) {
					vertexFound = true;
					break;
				}
			}

			if(!vertexFound) {
				allVerticesFound = false;
				break;
			}	
		}

		if(!allVerticesFound) {
			// backtrack
			console.log("Removing guard made a polygon vertex non visible, pushing back in");
			visibilityPolygons.push(visibilityPolygon);
			guards.push(guard);
			continue;
		}
		
		// check if union of remaining guards is whole polygon
		console.log("Unioning remaining visible polygons and checking");
		var visibleAreas = visibilityPolygons.slice(0, 1)[0].union(visibilityPolygons.slice(1), polygon);
		var nonVisibleAreas = Polygon.gpcToComplexPolygons(polygon.gpcPolygon().difference(visibleAreas.gpc), polygon);

		var containsNonVisibleAreas = false;
		if(nonVisibleAreas.polygons.length > 0) {
			for(var index = 0 ; index < nonVisibleAreas.length ; index++) {
				if( nonVisibleAreas.polygons[index].pointInPolygon() instanceof Point ) {
					containsNonVisibleAreas = true;
					break;
				}
			}
		}

		if(containsNonVisibleAreas) {
			// backtrack
			console.log("Remaining visible polygon union check failed, backtracking");
			visibilityPolygons.push(visibilityPolygon);
			guards.push(guard);
		}

		// passed all conditions, do not push back guard/visibilityPolygon
	};
}