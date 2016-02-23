Line.prototype.toVector = function() {
	return new Point(this.pointB.x - this.pointA.x, this.pointB.y - this.pointA.y);
};

Line.prototype.sign = function(line) {
					var vectorA = this.toVector();
					var vectorB = line.toVector();
					var crossProductMagnitude = vectorA.x * vectorB.y - vectorA.y * vectorB.x;
					if(crossProductMagnitude == 0)
						return 0;	// parallel
					else if(crossProductMagnitude > 0)
						return -1;	// counter clockwise
					else
						return 1;	// clockwise
				};

Line.prototype.midpoint = function() {
	return new Point((this.pointA.x + this.pointB.x) * 0.5, (this.pointA.y + this.pointB.y) * 0.5);
}

Line.prototype.intersects = function(line) {
	var p1 = this.pointA;
	var q1 = this.pointB;
	var p2 = line.pointA;
	var q2 = line.pointB;

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

Line.prototype.intersectsNotColinearNotVertex = function(line) {
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
}

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

var orientation = function(p, q, r) {
	var val = (q.y - p.y) * (r.x - q.x) -
			  (q.x - p.x) * (r.y - q.y);

	if (val == 0) return 0;
	
	return (val > 0) ? 1: 2;		  
}

var onSegment = function(p, q, r) {
	if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
    	return true;
 
    return false;
}

// Return 0 if parallel, -1 for left and 1 for right
var turnDirection = function(a, b, c) {
	return new Line(a, b).sign(new Line(a, c));
};

var left = -1;
var right = 1;
var parallel = 0;