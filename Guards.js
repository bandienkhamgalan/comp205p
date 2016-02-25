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

Polygon.prototype.colorGuards = function() {
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

var sortInSync = function(guards, visibilityPolygons) {
	var indices = [];

	for(var index = 0 ; index < visibilityPolygons.length; index++)
		indices.push(index);
	indices.sort((a, b) => { return visibilityPolygons[a].area() - visibilityPolygons[b].area(); });

	var guardsOriginal = guards.slice();
	var visibilityPolygonsOriginal = visibilityPolygons.slice();
	for(var index = 0 ; index < indices.length ; index++) {
		guards[index] = guardsOriginal[indices[index]];
		visibilityPolygons[index] = visibilityPolygonsOriginal[indices[index]];
	}
}

/* Iteration 2 – Remove redundant guards */

// make sure guards and visibilityPolygons are in sync
// performs removal in place on guards and visibilityPolygons
// specify "random", "sorted" or "weighted" as mode parameter
function removeRedundantGuards(polygon, guards, visibilityPolygons, mode) {
	switch(mode) {
		case "random":
			shuffleInSync(guards, visibilityPolygons);	// random removal
			break;
		case "sorted":
			sortInSync(guards, visibilityPolygons); 	// remove from smallest to largest area
			break;
		case "weighted":
		default:
			// run in original order
			break;
	}

	var polygonArea = polygon.area();
	var length = guards.length;
	var count = 0;
	while(count < length) {
		var guard = guards.splice(0, 1)[0];
		var visibilityPolygon = visibilityPolygons.splice(0, 1)[0];
		count++;

		console.log("Checking if removing guard " + count + " out of " + length + " invalidates visibility");

		// check if removing guard makes an area non visible
		if(!polygon.allAreasVisible(visibilityPolygons)) {
			// backtrack
			visibilityPolygons.push(visibilityPolygon);
			guards.push(guard);
		}

		// passed all conditions, do not push back guard/visibilityPolygon
	};
}

/* Iteration 3 – Greedy Algorithm on vertices & extended visible points from every vertex */

// will contain visibility extensions from every vertex
// specify at "boundary" or "midpoint" as parameter
Polygon.prototype.visibilityExtensions = function(mode) {
	var candidates = [];

	for(var i = 0 ; i < this.vertices.length ; i++) {
		for(var j = 0 ; j < this.vertices.length ; j++ ) {
			if(i == j)
				continue;

			var deltaX = this.vertices[j].x - this.vertices[i].x;
			var deltaY = this.vertices[j].y - this.vertices[i].y;
			var constant = 1000;
			var boundaryPoint = new Point(this.vertices[i].x + deltaX * constant, this.vertices[i].y + deltaY * constant);
			var vertexToBoundary = new Line(this.vertices[i], boundaryPoint);

			var intersectionPoints = this.intersectionsWithLine(vertexToBoundary, true);

			var previous = this.vertices[i];

			if(isVertexReachable(this.vertices[j], this, this.vertices[i])) {
				// extend until boundary
				for( var index = 1 ; index < intersectionPoints.length ; index++ ) {
					var current = intersectionPoints[index];
					var next = index + 1 < intersectionPoints.length ? intersectionPoints[index + 1] : boundaryPoint;
					var previousMidpointInside = this.containsPoint(new Line(previous, current).midpoint(), true);
					var nextMidpointInside = this.containsPoint(new Line(current, next).midpoint(), true);
					if( !previousMidpointInside )
						break;

					else if( previousMidpointInside && !nextMidpointInside )
					{
						// found intersection point of ray and boundary
						if(mode == "boundary") {
							if( candidates.filter(a => { return a.equals(current)}).length == 0 )
								candidates.push(current);
						} else if (mode == "midpoint") {
							var midpoint = new Line(this.vertices[j], current).midpoint();
							if( candidates.filter(a => { return a.equals(midpoint)}).length == 0 )
								candidates.push(midpoint);
						}
						break;
					}				
						
					previous = current;
				}
			}
		}
	} 

	return candidates;
}

// Return {guards: [Point], visibilityPolygons: [Polygon]}
// specify at "area", "vertex", "area" as last parameter (scoring)
var greedilySelectGuards = function(polygon, guardCandidates, visibilityPolygons, scoring) {
	var toReturn = {guards: [], visibilityPolygons: []};
	var gpcPolygon = polygon.gpcPolygon();
	
	var union = new PolyDefault();
	
	var length = guardCandidates.length;

	if( scoring == "guards") {
		// setup for guards mode
		for(var i = 0 ; i < guardCandidates.length ; i++ ) {
			visibilityPolygons[i].visibleGuardIndices = [];
			for(var j = 0 ; j < guardCandidates.length ; j++)
				if(visibilityPolygons[i].containsPoint(guardCandidates[j], true))
					visibilityPolygons[i].visibleGuardIndices.push(j);
		}
		var guardsVisible = [];
		var guardsVisibleCount = 0;
		for(var index = 0 ; index < guardCandidates.length ; index++)
			guardsVisible.push(false);
	}
	var guardAdded = [];
	for(var index = 0 ; index < guardCandidates.length ; index++)
		guardAdded.push(false);


	for(var a = 0 ; a < length ; a++) {
		var maxScore = -1;
		var maxScoreIndex = -1;
		if(scoring == "area") {			
			// add guard which adds most area
			var maxAddedUnion;
			for(var index = 0 ; index < guardCandidates.length ; index++) {
				if(guardAdded[index])
					continue;

				var addedPolygon = union.union(visibilityPolygons[index].gpcPolygon(polygon));
				var area = addedPolygon.getArea();
				if(equals(area, 0)) {
					guardAdded[index] = true; // ignore this guard
				} else if(area > maxScore) {
					maxScore = area;
					maxScoreIndex = index;
					maxAddedUnion = addedPolygon;
				}
			}

			guardAdded[maxScoreIndex] = true;
			toReturn.guards.push(guardCandidates[maxScoreIndex]);
			toReturn.visibilityPolygons.push(visibilityPolygons[maxScoreIndex]);

			union = maxAddedUnion;
			console.log("Choosing " + guardCandidates[maxScoreIndex] + " which adds " + (maxScore - union.getArea()));
		} else if (scoring == "guards") {
			// add guard which reveals most guards
			var maxSolution;
			for(var i = 0 ; i < guardsVisible.length ; i++) {
				if(guardAdded[i])
					continue;

				var currentScore = 0;
				var newSolution = guardsVisible.slice();
				for(var j = 0 ; j < visibilityPolygons[i].visibleGuardIndices.length ; j++)
				{
					var visibleGuardIndex = visibilityPolygons[i].visibleGuardIndices[j];
					if(guardsVisible[visibleGuardIndex] == false)
						currentScore++;
					newSolution[visibleGuardIndex] = true;
				}

				if(currentScore > maxScore) {
					maxScore = currentScore;
					maxScoreIndex = i;
					maxSolution = newSolution;
				}
			}

			if(maxScoreIndex >= 0) {
				console.log("Choosing " + guardCandidates[maxScoreIndex] + " which makes " + maxScore + " more vertices visible. ");
				guardsVisible = maxSolution;
				guardsVisibleCount += maxScore;
				guardAdded[maxScoreIndex] = true;
				union = union.union(visibilityPolygons[maxScoreIndex].gpcPolygon(polygon));	
				toReturn.guards.push(guardCandidates[maxScoreIndex]);
				toReturn.visibilityPolygons.push(visibilityPolygons[maxScoreIndex]);
				if(guardsVisibleCount < guardCandidates.length)
					continue;
			}
		}

		if(polygon.allAreasVisible(toReturn.visibilityPolygons, union))
			break;
	}

	return toReturn;
}

// Return {guards: [Point], visibilityPolygons: [Polygon]}
// specify at "area", "vertex", "area" as last parameter (scoring)
var greedilySelectGuardsProbabilistic = function(polygon, guardCandidates, visibilityPolygons, scoring) {
	var toReturn = {guards: [], visibilityPolygons: []};
	var gpcPolygon = polygon.gpcPolygon();
	
	var union = new PolyDefault();
	
	var length = guardCandidates.length;

	if( scoring == "guards") {
		// setup for guards mode
		for(var i = 0 ; i < guardCandidates.length ; i++ ) {
			visibilityPolygons[i].visibleGuardIndices = [];
			for(var j = 0 ; j < guardCandidates.length ; j++)
				if(visibilityPolygons[i].containsPoint(guardCandidates[j], true))
					visibilityPolygons[i].visibleGuardIndices.push(j);
		}
		var guardsVisible = [];
		var guardsVisibleCount = 0;
		for(var index = 0 ; index < guardCandidates.length ; index++)
			guardsVisible.push(false);
	}
	var guardAdded = [];
	for(var index = 0 ; index < guardCandidates.length ; index++)
		guardAdded.push(false);


	for(var a = 0 ; a < length ; a++) {
		var maxScore = -1;
		var maxScoreIndex = -1;
		if(scoring == "area") {			
			// add guard which adds most area
			var solutions = [];
			var cumulativeWeights = [];
			var currentSum = 0;

			for(var index = 0 ; index < guardCandidates.length ; index++) {
				if(guardAdded[index])
					continue;

				var addedPolygon = union.union(visibilityPolygons[index].gpcPolygon(polygon));
				var area = addedPolygon.getArea();
				if(equals(area, 0)) {
					guardAdded[index] = true; // ignore this guard
				} else {
					currentSum += Math.pow(area, 2);
					cumulativeWeights.push(currentSum);
					solutions.push({index: index, union: addedPolygon});
				}
			}

			var random = Math.random() * currentSum;
			var choice;
			for(var index = 0 ; index < cumulativeWeights.length ; index++ ) {
				if(random < cumulativeWeights[index]) {
					choice = solutions[index];
					break;
				}
			}

			guardAdded[choice.index] = true;
			toReturn.guards.push(guardCandidates[choice.index]);
			toReturn.visibilityPolygons.push(visibilityPolygons[choice.index]);

			union = choice.union;
			console.log("Choosing " + guardCandidates[choice.index] + " which adds " + (maxScore - choice.union.getArea()));
		} else if (scoring == "guards") {
			// add guard which reveals most guards
			var solutions = [];
			var cumulativeWeights = [];
			var currentSum = 0;

			for(var i = 0 ; i < guardsVisible.length ; i++) {
				if(guardAdded[i])
					continue;

				var currentScore = 0;
				var newSolution = guardsVisible.slice();
				for(var j = 0 ; j < visibilityPolygons[i].visibleGuardIndices.length ; j++)
				{
					var visibleGuardIndex = visibilityPolygons[i].visibleGuardIndices[j];
					if(guardsVisible[visibleGuardIndex] == false)
						currentScore++;
					newSolution[visibleGuardIndex] = true;
				}

				currentSum += Math.pow(currentScore + 1, 2); 
				cumulativeWeights.push(currentSum); 
				solutions.push({index: i, solution: newSolution, score: currentScore});	
			}

			var random = Math.random() * currentSum;
			var choice;
			for(var index = 0 ; index < cumulativeWeights.length ; index++ ) {
				if(random < cumulativeWeights[index]) {
					choice = solutions[index];
					break;
				}
			}

			if(typeof choice === 'object') {
				console.log("Choosing " + guardCandidates[choice.index] + " which makes " + choice.score + " more vertices visible. ");
				guardsVisible = choice.solution;
				guardsVisibleCount += choice.score;
				guardAdded[choice.index] = true;
				union = union.union(visibilityPolygons[choice.index].gpcPolygon(polygon));	
				toReturn.guards.push(guardCandidates[choice.index]);
				toReturn.visibilityPolygons.push(visibilityPolygons[choice.index]);
				if(guardsVisibleCount < guardCandidates.length)
					continue;
			}
		}

		if(polygon.allAreasVisible(toReturn.visibilityPolygons, union))
			break;
	}

	return toReturn;
}