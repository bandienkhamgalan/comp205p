var Line = function(pointA, pointB){
	this.pointA = pointA;
	this.pointB = pointB;
}

var fullVisibilityPolygon = function(polygon, guards){
	var vertices = polygon.vertices;
	
	var lines = getLines(vertices);
	
	var visiblePolygons = []; // list of list of points
	var numberOfGuards = guards.length;
	for (var i = 0; i < numberOfGuards; i++){
		var reachableVert = reachableVertices(vertices, lines, guards[i]);
		visiblePolygons.push(visiblePolygon(polygon, reachableVert, lines, guards[i]));
		console.log("reachable: ");
		console.log(reachableVert)
	}
	console.log(visiblePolygons)
	return visiblePolygons;
}


var visiblePolygon = function(polygon, reachableVertices, lines, guard){
	var numberOfVertices = reachableVertices.length;
	var numberOfLines = lines.length;
	var visiblePolygon = [];

	for (var i = 0; i < numberOfVertices; i++){
		console.log("main loop")
		var intersectionPoints = [];
		var deltaX = reachableVertices[i].x - guard.x;
		var deltaY =  reachableVertices[i].y - guard.y;
		var constant = 1000;
		var boundaryPoint = new Point(reachableVertices[i].x + deltaX*constant, reachableVertices[i].y + deltaY*constant);
		var lineFromVertexToBoundary = new Line(boundaryPoint,reachableVertices[i]);
		console.log(reachableVertices[i])
		for (var j = 0; j < numberOfLines; j++){
			console.log("looooooooping")
			console.log(lineFromVertexToBoundary)
			console.log(lines[j])
			var intersectionPoint = intersectionOfSegments(lineFromVertexToBoundary, lines[j]);
			console.log("intersection point: ");
			console.log(intersectionPoint);
			if((intersectionPoint != null) && (!((intersectionPoint.x == lines[j].pointA.x) && (intersectionPoint.y == lines[j].pointA.y)))){
				if(!((intersectionPoint.x == lines[j].pointB.x) && (intersectionPoint.y == lines[j].pointB.y))){
					intersectionPoints.push(intersectionPoint);
				}
			}
		}
		// go through intersection points and find point closest to the vertex
		console.log(intersectionPoints)
		var minDistance = Infinity;
		var closestPoint = null;
		for(var k = 0; k < intersectionPoints.length; k++){
			var distance = Math.sqrt(Math.pow((intersectionPoints[k].x - reachableVertices[i].x), 2)
				+ Math.pow((intersectionPoints[k].y - reachableVertices[i].y), 2));
			if(distance < minDistance){
				minDistance = distance;
				closestPoint = intersectionPoints[k];
			}
		}
		if(closestPoint != null){
			var midPoint = new Point((closestPoint.x + reachableVertices[i].x)/2.0, (closestPoint.y + reachableVertices[i].y)/2.0);
			if(polygon.containsPoint(midPoint)){
				if((closestPoint.y == reachableVertices[i].y) || (closestPoint.x == reachableVertices[i].x)){
					visiblePolygon.push(reachableVertices[i]);
					visiblePolygon.push(closestPoint);
				}
				else if(closestPoint.y > reachableVertices[i].y){
					if(closestPoint.x > reachableVertices[i].x){
						visiblePolygon.push(closestPoint);
						visiblePolygon.push(reachableVertices[i]);
					}
					else{
						visiblePolygon.push(reachableVertices[i]);
						visiblePolygon.push(closestPoint);
					}
				}
				else{
					if(closestPoint.x > reachableVertices[i].x){
						visiblePolygon.push(reachableVertices[i]);
						visiblePolygon.push(closestPoint);
					}
					else{
						visiblePolygon.push(closestPoint);
						visiblePolygon.push(reachableVertices[i]);
					}
				}

			}
			else{
				visiblePolygon.push(reachableVertices[i]);
			}
		}
		else{
			visiblePolygon.push(reachableVertices[i]);
		}
	}
	return visiblePolygon
}

var intersectionOfSegments = function(lineA, lineB){
	var p1x = lineA.pointA.x;
	var p1y = lineA.pointA.y;
	var p2x = lineA.pointB.x;
	var p2y = lineA.pointB.y;

	var p3x = lineB.pointA.x;
	var p3y = lineB.pointA.y;
	var p4x = lineB.pointB.x;
	var p4y = lineB.pointB.y;

	var d = (p2x - p1x)*(p4y - p3y) - (p2y - p1y)*(p4x - p3x);
	if (d == 0){
		return null;
	}
	var u = ((p3x - p1x)*(p4y - p3y) - (p3y - p1y)*(p4x - p3x))/d;
    var v = ((p3x - p1x)*(p2y - p1y) - (p3y - p1y)*(p2x - p1x))/d;
    if (u < 0.0 || u > 1.0)
        return null; // intersection point not between p1 and p2
    if (v < 0.0 || v > 1.0)
        return null; // intersection point not between p3 and p4
    var intersectionX = p1x + u * (p2x - p1x);
    var intersectionY = p1y + u * (p2y - p1y);
    var intersection = new Point(intersectionX, intersectionY);
    return intersection;
}



// var visiblePolygon = function(reachableVertices, lines, guard){
// 	var numberOfVertices = reachableVertices.length;
// 	var numberOfLines = lines.length;
// 	var visiblePolygon;

// 	for (var i = 0; i < numberOfVertices; i++){
// 		var guardToVertexGradient = computeGradient(guard, reachableVertices[i]);
// 		var guardToVertexintercept;
// 		if (guardToVertexGradient != Infinity)
// 			guardToVertexIntercept = guard.y - guardToVertexGradient * guard.x;
	
// 		for (var j = 0; j < numberOfLines; j++){
// 			var polygonLineGradient = computeGradient(line.pointA, line.pointB);
// 			if ( guardToVertexGradient != polygonLineGradient ){
// 				// get intersection between two lines
// 				if (polygonLineGradient != Infinity && guardToVertexGradient != Infinity){
// 					polygonLineIntercept = line.pointA.y - polygonLineGradient * liine.pointA.x;
// 					var xIntercept = (polygonLineIntercept - guardToVertexGradient) / (guardToVertexGradient - polygonLineGradient)
// 					var yIntercept = (xIntercept * guard.x + guardToVertexintercept)
// 				}
// 				else{
// 					if(polygonLineGradient == Infinity)
// 						var xintercept = line.pointA.x
// 					else var x intercept = guard.
// 				}
// 			}
// 		}
// 		// find intersections of line from guard to vertex & polygon (lines)

// 	}

// }


var computeGradient = function(p, q){
	if (p.x - q.x == 0){
		return Infinity;
	}
	return (p.y - q.y)/(p.x - q.x);
}

var getLines = function (vertices){
	var lines = [];
	var numberOfVertices = vertices.length;
	for (var i = 0; i < numberOfVertices; i++){
		if ( i == numberOfVertices - 1 ){
			lines.push(new Line(vertices[i], vertices[0]));
			break;
		}
		lines.push(new Line(vertices[i], vertices[i+1]));
	}
	return lines;
}

var reachableVertices = function(vertices, lines, guard){
	var visibleVertices = [];
	var numberOfVertices = vertices.length;
	for (var i = 0; i < numberOfVertices; i++){
		if (isVertexReachable(vertices[i], lines, guard)){ 
			
			visibleVertices.push(vertices[i]);
		}
	}
	return visibleVertices;
}

var isVertexReachable = function(vertex, lines, guard){
	// vertex and guard are of type point
	var lineGuardToVertex = new Line(vertex, guard);
	var numberOfLines = lines.length;
	for (var i = 0; i < numberOfLines; i++){
		
		if(lineGuardToVertex.pointA == lines[i].pointA || lineGuardToVertex.pointA == lines[i].pointB ||
			lineGuardToVertex.pointB == lines[i].pointA || lineGuardToVertex.pointB == lines[i].pointB ){
			continue;
		}


		if ( doIntersect(lines[i], lineGuardToVertex) ){
			return false;
		}
	}
	return true;
}

var doIntersect = function(lineA, lineB){
	var p1 = lineA.pointA;
	var q1 = lineA.pointB;
	var p2 = lineB.pointA;
	var q2 = lineB.pointB;

	var o1 = orientation(p1, q1, p2);
    var o2 = orientation(p1, q1, q2);
    var o3 = orientation(p2, q2, p1);
    var o4 = orientation(p2, q2, q1);

       // General case
    if (o1 != o2 && o3 != o4)
        return true;
 
    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;
 
    // p1, q1 and p2 are colinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;
 
    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;
 
     // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;
 
    return false; 
}

var orientation = function(p, q, r){
	var val = (q.y - p.y) * (r.x - q.x) -
			  (q.x - p.x) * (r.y - q.y);

	if (val == 0) return 0;
	
	return (val > 0)? 1: 2;		  
}

var onSegment = function(p, q, r){
	if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
    	return true;
 
    return false;
}