var Line = function(pointA, pointB){
	this.pointA = pointA;
	this.pointB = pointB;
}

var visibilityPolygon = function(vertices, guards){
	var lines = getLines(vertices);
	var visiblePolygons; // list of list of points
	var numberOfGuards = guards.length;
	for (var i = 0; i < numberOfGuards; i++){
		var reachableVertices = reachableVertices(vertices, lines, guard[i]);
		visiblePolygons.push(visiblePolygon(reachableVertices, lines, guard[i]));
	}

}

var visiblePolygon = function(reachableVertices, lines, guard){
	var numberOfVertices = reachableVertices.length;
	var numberOfLines = lines.length;
	var visiblePolygon;

	for (var i = 0; i < numberOfVertices; i++){
		var guardToVertexGradient = computeGradient(guard, reachableVertices[i]);
		var guardToVertexintercept;
		if (guardToVertexGradient != Infinity)
			guardToVertexIntercept = guard.y - guardToVertexGradient * guard.x;
	
		for (var j = 0; j < numberOfLines; j++){
			var polygonLineGradient = computeGradient(line.pointA, line.pointB);
			if ( guardToVertexGradient != polygonLineGradient ){
				// get intersection between two lines
				if (polygonLineGradient != Infinity && guardToVertexGradient != Infinity)
					polygonLineIntercept = line.pointA.y - polygonLineGradient * liine.pointA.x;

			}
		}
		// find intersections of line from guard to vertex & polygon (lines)
	}
}


var computeGradient = function(p, q){
	if (p.x - q.x == 0){
		return Infinity;
	}
	return (p.y - q.y)/(p.x - q.x);
}

var getLines = function (vertices){
	var lines;
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
	var visibleVertices;
	var numberOfVertices = vertices.length;
	for (var i = 0; i < numberOfVertices; i++){
		if (isVertexReachable(vertices[i], lines, guard)){ // can the guard reach the vertex?
			visibleVertices.push(vertices[i]);
		}
	}
}

var isVertexReachable = function(vertex, lines, guard){
	// vertex and guard are of type point
	var lineGuardToVertex = new Line(vertex, guard);
	var numberOfLines = lines.length;
	for (var i = 0; i < numberOfLines; i++){
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
	if (q.x <= max(p.x, r.x) && q.x >= min(p.x, r.x) &&
        q.y <= max(p.y, r.y) && q.y >= min(p.y, r.y))
    	return true;
 
    return false;
}