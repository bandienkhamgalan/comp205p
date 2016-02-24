var Point = function(x, y) {
	this.x = parseFloat(x); 
	this.y = parseFloat(y);
};

Point.prototype.toString = function() {
	return "(" + this.x.toFixed(10) + ", " + this.y.toFixed(10) + ")";
};

Point.prototype.equals = function(point) {
	if(point instanceof Point)
		return equals(this.x, point.x) && equals(this.y, point.y);
	else
		return
};

Point.prototype.toList = function() {
	return [this.x, this.y];
}