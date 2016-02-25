var PolyDefault = gpcas.geometry.PolyDefault ;
var ArrayList = gpcas.util.ArrayList;
var PolySimple = gpcas.geometry.PolySimple;
var Clip = gpcas.geometry.Clip;
var OperationType = gpcas.geometry.OperationType;
var LmtTable = gpcas.geometry.LmtTable;
var ScanBeamTreeEntries = gpcas.geometry.ScanBeamTreeEntries;
var EdgeTable = gpcas.geometry.EdgeTable;
var EdgeNode = gpcas.geometry.EdgeNode;
var ScanBeamTree = gpcas.geometry.ScanBeamTree;
var Rectangle = gpcas.geometry.Rectangle;
var BundleState = gpcas.geometry.BundleState;
var LmtNode = gpcas.geometry.LmtNode;
var TopPolygonNode = gpcas.geometry.TopPolygonNode;
var AetTree = gpcas.geometry.AetTree;
var HState = gpcas.geometry.HState;
var VertexType = gpcas.geometry.VertexType;
var VertexNode = gpcas.geometry.VertexNode;
var PolygonNode = gpcas.geometry.PolygonNode;
var ItNodeTable = gpcas.geometry.ItNodeTable;
var StNode = gpcas.geometry.StNode;
var ItNode = gpcas.geometry.ItNode;

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

Polygon.prototype.containsPoint = function(point, boundariesIncluded) {
	var intersections = 0;
	var line = new Line(new Point(this.minX - 1, point.y), point);
	for(var index = 0 ; index < this.lines.length ; index++) {
		var side = this.lines[index];
		if( side.containsPoint(point) )
			return boundariesIncluded;

		if( line.intersects(side) ) {
			if( !equals(side.pointA.y, point.y) && !equals(side.pointB.y, point.y) ) // regular intersection
				intersections++;
			else
			{
				// intersection is vertex
				if( equals(side.pointA.y, point.y) && lessThan(side.pointB.y, point.y) )
					intersections++;
				if( equals(side.pointB.y, point.y) && lessThan(side.pointA.y, point.y) )
					intersections++;
			}
		}
	}
	return intersections % 2 == 1;
}

/* Polygon.prototype.containsPolygon = function(polygon) {
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
} */

// Return [Point]
Polygon.prototype.intersectionsWithLine = function(line, sorted) {
	var toReturn = [];
	for(var index = 0 ; index < this.lines.length ; index++) {
		var edge = this.lines[index];
		var intersectionPoint = edge.intersectionPoint(line);
		if(intersectionPoint != null && toReturn.filter(a => { return a.equals(intersectionPoint); }).length == 0) {
			toReturn.push(intersectionPoint);
		}
	}

	// sort intersection points by distance to vertex
	if(sorted) {
		toReturn.sort((a, b) => {
			var aDistance = Math.sqrt(Math.pow(a.x - line.pointA.x, 2) + Math.pow(a.y - line.pointA.y, 2));
			var bDistance = Math.sqrt(Math.pow(b.x - line.pointA.x, 2) + Math.pow(b.y - line.pointA.y, 2));
			return aDistance - bDistance;
		})
	}

	return toReturn;
}

Polygon.prototype.pointInPolygon = function() {
	var toReturn;
	for(var i = 0 ; i < this.lines.length ; i++) {
		var midpoint = this.lines[i].midpoint();
		for(var j = 0 ; j < this.vertices.length ; j++) {
			var candidate = new Line(midpoint, this.vertices[j]).midpoint();
			if(this.containsPoint(candidate, false)) {
				toReturn = candidate;
				break;
			}
		}
	}

	return toReturn;
};

Polygon.prototype.gpcPolygon = function(offsetPolygon) {
	if(typeof offsetPolygon === 'undefined')
		offsetPolygon = this;

	this.GPC = new PolyDefault();
	for( var index = 0 ; index < this.vertices.length ; index++ ) {
		var point = new Point(this.vertices[index].x, this.vertices[index].y);
		point.x -= (offsetPolygon.minX - 1);
		point.y -= (offsetPolygon.minY - 1);
		this.GPC.addPoint(point);
	}
	return this.GPC;
}

// will not be accurate if polygon is modified
Polygon.prototype.area = function() {
	if(typeof this.computedArea === 'undefined')
		this.computedArea = this.gpcPolygon().getArea();

	return this.computedArea;
}

// Returns {polygons: [Polygon], holes: [Polygon]}
Polygon.prototype.union = function(polygons, offsetPolygon) {
	if(typeof offsetPolygon === 'undefined')
		offsetPolygon = this;

	var union = this.gpcPolygon(offsetPolygon);
	for(var x = 0 ; x < polygons.length ; x++) {
		union = union.union(polygons[x].gpcPolygon(offsetPolygon)); 
	}

	return Polygon.gpcToComplexPolygons(union, offsetPolygon);
}

// Returns {polygons: [Polygon], holes: [Polygon]}
Polygon.prototype.difference = function(polygons, offsetPolygon) {
	if(typeof offsetPolygon === 'undefined')
		offsetPolygon = this;

	var difference = this.gpcPolygon(offsetPolygon);
	for(var x = 0 ; x < polygons.length ; x++)
		difference = difference.difference(polygons[x].gpcPolygon(offsetPolygon)); 

	return Polygon.gpcToComplexPolygons(difference, offsetPolygon);
}

// Returns {polygons: [Polygon], holes: [Polygon]}
Polygon.gpcToComplexPolygons = function(gpc, offsetPolygon) {
	var complexPolygon = {polygons: [], holes: [], gpc: gpc};
	var innerPolygonCount = gpc.getNumInnerPoly();

	for(var i = 0 ; i < innerPolygonCount ; i++) {
		var currentGPC = gpc.getInnerPoly(i);

		var convertedVertices = [];
		var vertexCount = currentGPC.getNumPoints();
		for(var j = 0 ; j < vertexCount ; j++)
			convertedVertices.push(new Point(currentGPC.getX(j) + (offsetPolygon.minX - 1), currentGPC.getY(j) + (offsetPolygon.minY - 1)));

		if(currentGPC.isHole())
			complexPolygon.holes.push(new Polygon(convertedVertices));
		else
			complexPolygon.polygons.push(new Polygon(convertedVertices));
	}

	return complexPolygon;
}

// Returns True if visibilityPolygons covers all areas
// unionedGPC is an optional parameter for optimization, should hold union of visibilityPolygons
Polygon.prototype.allAreasVisible = function(visibilityPolygons, unionedGPC) {
	// fast check -> all vertices visible
	for(var i = 0 ; i < this.vertices.length ; i++ ) {
		var searchVertex = this.vertices[i];
		var vertexFound = false;
		for(var j = 0 ; j < visibilityPolygons.length ; j++ ) {
			if(visibilityPolygons[j].vertices.filter(vertex => {return vertex.equals(searchVertex)}).length > 0) {
				vertexFound = true;
				break;
			}
		}

		if(!vertexFound) {
			return false;
		}	
	}

	// slow, guaranteed check -> union of visibility polygons equal to original polygon
	if(typeof unionedGPC === 'undefined') {
		// calculate union
		var nonVisibleAreas = this.nonVisibleAreas(visibilityPolygons);
		return nonVisibleAreas.length == 0;

	} else {
		// use supplied/precomputed union
		var nonVisibleAreas = this.nonVisibleAreasGPC(unionedGPC);
		return nonVisibleAreas.length == 0;
	}
}

// Returns [Polygon]
Polygon.prototype.nonVisibleAreas = function(visibilityPolygons) {
	var union = new PolyDefault();
	for(var index = 0 ; index < visibilityPolygons.length ; index++ ) 
		union = union.union(visibilityPolygons[index].gpcPolygon(this));

	return this.nonVisibleAreasGPC(union);
} 

// Returns [Polygon]
Polygon.prototype.nonVisibleAreasGPC = function(unionedGPC) {
	var areas = Polygon.gpcToComplexPolygons(this.gpcPolygon(this).difference(unionedGPC), this).polygons;

	// remove invalid nonVisibleAreas (areas where a point inside cannot be found)
	if(areas.length > 0) {
		var index = 0;
		while(index < areas.length) {
			if( areas[index].pointInPolygon() instanceof Point )
				index++;
			else
				areas.splice(index, 1);
		}
	}

	return areas;
} 