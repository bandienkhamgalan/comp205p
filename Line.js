var Line = function(pointA, pointB){
	this.pointA = pointA;
	this.pointB = pointB;
}

Line.prototype.toVector = function() {
	return new Point(this.pointB.x - this.pointA.x, this.pointB.y - this.pointA.y);
};

Line.prototype.midpoint = function() {
	return new Point((this.pointA.x + this.pointB.x) * 0.5, (this.pointA.y + this.pointB.y) * 0.5);
}

// Return Point object on success
// and null on failure (parallel lines or no intersection)
Line.prototype.intersectionPoint = function(line) {
	var p1x = this.pointA.x;
	var p1y = this.pointA.y;
	var p2x = this.pointB.x;
	var p2y = this.pointB.y;

	var p3x = line.pointA.x;
	var p3y = line.pointA.y;
	var p4x = line.pointB.x;
	var p4y = line.pointB.y;

	var d = (p2x - p1x)*(p4y - p3y) - (p2y - p1y)*(p4x - p3x);
	if (equals(d, 0))
		return null;
	
	var u = ((p3x - p1x)*(p4y - p3y) - (p3y - p1y)*(p4x - p3x))/d;
    var v = ((p3x - p1x)*(p2y - p1y) - (p3y - p1y)*(p2x - p1x))/d;
    var u = ((p3x - p1x)*(p4y - p3y) - (p3y - p1y)*(p4x - p3x))/d;
    var v = ((p3x - p1x)*(p2y - p1y) - (p3y - p1y)*(p2x - p1x))/d;
    if (lessThan(u, 0.0) || greaterThan(u, 1.0))
        return null; // intersection point not between p1 and p2
    if (lessThan(v, 0.0) || greaterThan(v, 1.0))
        return null; // intersection point not between p3 and p4
    var intersectionX = p1x + u * (p2x - p1x);
    var intersectionY = p1y + u * (p2y - p1y);
    var intersection = new Point(intersectionX, intersectionY);

    return intersection;
}

// includes vertices
Line.prototype.intersects = function(line) {
	var o1 = turnDirection(this.pointA, this.pointB, line.pointA);
	var o2 = turnDirection(this.pointA, this.pointB, line.pointB);
    var o3 = turnDirection(line.pointA, line.pointB, this.pointA);
    var o4 = turnDirection(line.pointA, line.pointB, this.pointB);

      // General case
    if (o1 != o2 && o3 != o4)
    	return true;
 
    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (equals(o1, 0) && this.containsPoint(line.pointA))
    	return true;
 
    // p1, q1 and p2 are colinear and q2 lies on segment p1q1
    if (equals(o2, 0) && this.containsPoint(line.pointB))
    	return true;
 
    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (equals(o3, 0) && line.containsPoint(this.pointA))
    	return true;
 
     // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (equals(o3, 0) && line.containsPoint(this.pointB))
    	return true;
 
    return false; 
}

/* Line.prototype.intersectsNotColinearNotVertex = function(line) {
	var p1 = this.pointA;
	var q1 = this.pointB;
	var p2 = line.pointA;
	var q2 = line.pointB;

	var o1 = orientation(p1, q1, p2);
    var o2 = orientation(p1, q1, q2);
    var o3 = orientation(p2, q2, p1);
    var o4 = orientation(p2, q2, q1);

       // General case
    if (o1 != o2 && o3 != o4) {
    	// intersects but may be at vertex
    	if(this.pointA.equals(line.pointA) || this.pointA.equals(line.pointB) ||
			this.pointB.equals(line.pointA) || this.pointB.equals(line.pointB) )
			return false;
        else
        	return true; 
    }
    return false;
} */

Line.prototype.gradient = function() {
	if(equals(this.pointA.x, this.pointB.x)) 
		return Infinity;
	else if(equals(this.pointA.y, this.pointB.y))
		return 0; 
	else
		return (this.pointA.y - this.pointB.y) / (this.pointA.x - this.pointB.x);
}

Line.prototype.length = function() {
	return Math.sqrt(Math.pow(this.pointB.x - this.pointA.x, 2) + Math.pow(this.pointB.y - this.pointA.y, 2));
}

Line.prototype.containsPoint = function(point) { 
	var gradient = this.gradient();
	var lowerX = Math.min(this.pointA.x, this.pointB.x);
	var lowerY = Math.min(this.pointA.y, this.pointB.y);
	var higherX = Math.max(this.pointA.x, this.pointB.x);
	var higherY = Math.max(this.pointA.y, this.pointB.y);
	switch( gradient ) {
		case Infinity:
			return equals(this.pointA.x, point.x) && greaterThanOrEqualTo(point.y, lowerY) && lessThanOrEqualTo(point.y, higherY);
		case 0:
			return equals(this.pointA.y, point.y) && greaterThanOrEqualTo(point.x, lowerX) && lessThanOrEqualTo(point.x, higherX);
		default:
			var predictedYValue = gradient * (point.x - this.pointA.x) + this.pointA.y;
			return greaterThanOrEqualTo(point.x, lowerX) && lessThanOrEqualTo(point.x, higherX) && equals(point.y, predictedYValue);
	}
}

// Return 0 if parallel, -1 for left and 1 for right
var turnDirection = function(a, b, c) {
	var crossProductMagnitude = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
	if(equals(crossProductMagnitude, 0))
		return 0;	// parallel
	else if(greaterThan(crossProductMagnitude, 0))
		return -1;	// counter clockwise
	else
		return 1;	// clockwise
};

var left = -1;
var right = 1;
var parallel = 0;