var epsilonMultiplier = 1.5;

var fullVisibilityPolygon = function(polygon, guards) {
	var vertices = polygon.vertices;
	
	var visibilityPolygons = []; // list of list of points
	var numberOfGuards = guards.length;
	for ( var i = 0 ; i < numberOfGuards ; i++ ) {
		var reachableVert = reachableVertices(vertices, polygon, guards[i]);
		//console.log("reachable: ")
		//console.log(reachableVert)
		var extendedVertices = extendVisibleVertices(polygon, reachableVert, guards[i]);
		visibilityPolygons.push(new Polygon(visibleVerticesInOrder(polygon, extendedVertices)));
	}

	return visibilityPolygons;
}

var visibleVerticesInOrder = function(polygon, extendedVertices) {
	var sorted = [];
	for(var i = 0 ; i < polygon.lines.length ; i++ ) {
		var currentLine = polygon.lines[i];
		var verticesOnLine = [];
		for(var j = 0 ; j < extendedVertices.length ; j++ )
			if(currentLine.containsPoint(extendedVertices[j]))
				verticesOnLine.push(extendedVertices[j]);
		
		// sort by distance from start of currentLine
		verticesOnLine.sort((a, b) => {
			var distanceToA = new Line(currentLine.pointA, a).length();
			var distanceToB = new Line(currentLine.pointA, b).length();
			return distanceToA - distanceToB;
		});

		sorted.push(...verticesOnLine);
	}

	if( sorted.length > 1 ) {
		if( sorted[0] == sorted[sorted.length - 1] )
			sorted.splice(sorted.length - 1, 1);

		var lastUniqueValue = sorted[0];
		var index = 1;
		while( index < sorted.length ) {
			if(sorted[index] == lastUniqueValue) {
				sorted.splice(index, 1);
			}
			else {
				lastUniqueValue = sorted[index];
				index++;
			}
		}
	}
	
	return sorted;
}

var extendVisibleVertices = function(polygon, reachableVertices, guard){
	var numberOfVertices = reachableVertices.length;
	var numberOfLines = polygon.lines.length;
	var visiblePolygon = [];

	for( var i = 0; i < numberOfVertices; i++ ) {
		var deltaX = reachableVertices[i].x - guard.x;
		var deltaY =  reachableVertices[i].y - guard.y;
		var constant = 1000;
		var boundaryPoint = new Point(reachableVertices[i].x + deltaX * constant, reachableVertices[i].y + deltaY * constant);
		var lineFromVertexToBoundary = new Line(reachableVertices[i], boundaryPoint);

		var intersectionPoints = polygon.intersectionsWithLine(lineFromVertexToBoundary, true);

		// console.log(intersectionPoints + " for vertex " + reachableVertices[i]);

		var closestPoint = null;
		var previousPoint = guard;
		for( var index = 0 ; index < intersectionPoints.length ; index++ ) {
			var candidate = intersectionPoints[index];
			var nextPoint = index + 1 < intersectionPoints.length ? intersectionPoints[index + 1] : boundaryPoint;

			var midpointBefore = new Line(previousPoint, candidate).midpoint();
			var midpointAfter = new Line(candidate, nextPoint).midpoint();
			if( !polygon.containsPoint(midpointBefore, true) || !polygon.containsPoint(midpointAfter, true) ) {
				closestPoint = candidate;
				break;
			}
			previousPoint = candidate;
		}

		// console.log(closestPoint + " is closest intersection for vertex " + reachableVertices[i]);

		if(closestPoint != null) {
			if(visiblePolygon.filter(x => { return x.equals(reachableVertices[i]) }).length == 0)
				visiblePolygon.push(reachableVertices[i]);
			if(visiblePolygon.filter(x => { return x.equals(closestPoint) }).length == 0)
				visiblePolygon.push(closestPoint);
		}
		else {
			if(visiblePolygon.filter(x => { return x.equals(reachableVertices[i]) }).length == 0)
				visiblePolygon.push(reachableVertices[i]);
		}
	}
	//console.log(JSON.stringify(visiblePolygon));
	return visiblePolygon;
}

var reachableVertices = function(vertices, polygon, guard){
	var visibleVertices = [];
	var numberOfVertices = vertices.length;
	for (var i = 0; i < numberOfVertices; i++){
		if (isVertexReachable(vertices[i], polygon, guard)) { 
			visibleVertices.push(vertices[i]);
		}
	}

	// console.log("Visible vertices ( " + visibleVertices.length + "): ");
	// console.log(JSON.stringify(visibleVertices));
	return visibleVertices;
}

var isVertexReachable = function(vertex, polygon, guard){
	// vertex and guard are of type point
	var guardToVertex = new Line(guard, vertex);
	var intersectionPoints = polygon.intersectionsWithLine(guardToVertex, true);

	var previous = guard;
	for( var index = 1 ; index < intersectionPoints.length ; index++ ) {
		var point = intersectionPoints[index];
		if( !polygon.containsPoint(new Line(previous, point).midpoint(), true) )
			return false;
		previous = point;
	}

	return true;
}