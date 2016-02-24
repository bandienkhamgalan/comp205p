var pago, scaleFactor = 1, unit;
var panX, panY;
var triangles, visibilityPolygons;
var mouseX, mouseY, clicked;

var resolutionMultiplier = 4;

function initCanvas() {

  var canvas = document.getElementById("myCanvas");

  var width = window.innerWidth - 10;
  var height = window.innerHeight - 50; 
  canvas.width = resolutionMultiplier * width;
  canvas.height = resolutionMultiplier * height;
  canvas.style.width = width;
  canvas.style.height = height;

  canvas.addEventListener("mousemove", function(event) {
    var rect = canvas.getBoundingClientRect();
    var x = (event.clientX - rect.left) / scaleFactor * resolutionMultiplier;
    var y = (event.clientY - rect.top) / -scaleFactor * resolutionMultiplier;
    x = (x - panX);
    y = (y - panY);
    if(clicked) {
      panX += (x - mouseX);
      panY += (y - mouseY);
      redraw();
    }
    else {
      var mapId = parseInt(document.getElementById("mapId").value) - 1;
      document.getElementById("mouseCoordinates").innerHTML = "Mouse at (" + x.toFixed(3) + ", " + y.toFixed(3) + ")";
      document.getElementById("mouseCoordinates").innerHTML += pago[mapId].polygon.containsPoint(new Point(x, y), true) ? " inside" : " outside";
    }
  });

  canvas.addEventListener('mousewheel', function(event) {
    event.preventDefault();
    var delta = event.wheelDelta ? event.wheelDelta / 40 : event.detail ? -event.detail : 0;

    

    /*var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    panX *= Math.pow(1.0025, delta) * (x * resolutionMultiplier / canvas.width);
    panY *= Math.pow(1.0025, delta) * (y * resolutionMultiplier / canvas.height); */
    scaleFactor *= Math.pow(1.025, delta);
    unit = 0.005 * 200 / scaleFactor;
    redraw();
  });

  canvas.addEventListener('mousedown', function(event) {
    var rect = canvas.getBoundingClientRect();
    var x = (event.clientX - rect.left) / scaleFactor * resolutionMultiplier;
    var y = (event.clientY - rect.top) / -scaleFactor * resolutionMultiplier;
    x = (x - panX);
    y = (y - panY);
    clicked = true;
    mouseX = x;
    mouseY = y;
  });

  canvas.addEventListener('mouseup', function(event) {
    clicked = false;
  });

  canvas.addEventListener('mouseout', function(event) {
    clicked = false;
  });
}

function newFile(file) {
  getPolygonAndGuards(file, function(pag) {
    pago = pag;
    recompute();
    redraw();
  });
}

function recompute() {
  var mapId = parseInt(document.getElementById("mapId").value) - 1;
  var polygon = pago[mapId].polygon;
  var guards = pago[mapId].guards;
  // triangles = polygon.findEars(); 
  visibilityPolygons = fullVisibilityPolygon(polygon, guards);
  var scaleFactorX = document.getElementById("myCanvas").width / (1.05 * polygon.rangeX);
  var scaleFactorY = document.getElementById("myCanvas").height / (1.05 * polygon.rangeY);
  scaleFactor = Math.min(scaleFactorX, scaleFactorY);
  panX = -polygon.minX + 0.025 * polygon.rangeX;
  panY = -polygon.minY - polygon.rangeY - (0.025 * polygon.rangeY);
  unit = 0.005 * 200 / scaleFactor;
}

function redraw() {
  drawEverything(pago);
}

function drawEverything(pag) {
  var canvas = document.getElementById("myCanvas");
  var c = canvas.getContext('2d');

  var mapId = parseInt(document.getElementById("mapId").value) - 1;
  c.setTransform(1,0,0,1,0,0);
  c.clearRect(0,0, canvas.width, canvas.height);
  scaleCanvas(c);

  drawPolygon(c, pag[mapId].polygon.vertices);

  // draw triangles
  /* 
  var triangles = pag[mapId].polygon.findEars(); 
  for( var index = 0 ; index < triangles.length ; index++ )
  {
    var ear = triangles[index];
    c.beginPath();
    c.moveTo(pag[mapId].polygon.vertices[ear[0]].x, pag[mapId].polygon.vertices[ear[0]].y);
    c.lineTo(pag[mapId].polygon.vertices[ear[1]].x, pag[mapId].polygon.vertices[ear[1]].y);
    c.lineTo(pag[mapId].polygon.vertices[ear[2]].x, pag[mapId].polygon.vertices[ear[2]].y);
    c.closePath();
    c.lineWidth = 0.25 * unit;
    c.stroke();
  }  */

  // draw visibility polygon
  
  var guardId = document.getElementById("guardId").value;
  if (guardId < 0) {
    if(visibilityPolygons.length > 0) {
      polygons = visibilityPolygons.map(vertices=>{return new Polygon(vertices)});
      var polygon = polygons.pop();
      var toDraw = polygon.union(polygons, pag[mapId].polygon);
      for( var index = 0 ; index < toDraw.polygons.length ; index++ )
        drawPolygon(c, toDraw.polygons[index].vertices, "rgba(255, 255, 0, 0.25)");
      
      for( var index = 0 ; index < toDraw.holes.length ; index++ )
        drawPolygon(c, toDraw.holes[index].vertices, "tomato");
    }
    drawGuardPoints(c, pag[mapId].guards);
  } else {
    drawPolygon(c, visibilityPolygons[guardId], "rgba(255, 255, 0, 0.25)");
    drawGuardPoints(c, [pag[mapId].guards[guardId]]);
  } 

  // pag[mapId].polygon.printGuardPositions();
  // drawColoredVertices(c, pag[mapId].polygon);

  // draw origin
  c.fillStyle = 'yellow';
  c.beginPath();
  c.arc(0,0,6 * unit,0,2*Math.PI);
  c.fill();
}

function scaleCanvas(c) {
  c.scale(scaleFactor, -scaleFactor);
  c.translate(panX, panY);
}

function drawPolygon(c, points) {
  c.fillStyle = arguments.length == 3 ? arguments[2] : 'white';
  c.beginPath();
  c.moveTo(points[0].x, points[0].y);
  var i = 1;
  for(i = 1; i < points.length; i++) {
    c.lineTo(points[i].x, points[i].y);
  }
  c.lineTo(points[0].x, points[0].y);
  c.closePath();
  c.fill();  
}

function drawColoredVertices(c, polygon) {
  for(var index = 0 ; index < polygon.vertices.length ; index++) {
    var vertex = polygon.vertices[index];
    c.fillStyle = vertex.color == "r" ? "red" : vertex.color == "g" ? "green" : "blue";
    c.beginPath();
    c.arc(vertex.x,vertex.y, 15 * unit, 0, 2 * Math.PI);
    c.fill();
  }
}

function drawGuardPoints(c, points) {
  c.fillStyle = 'black';
  for(var i = 0; i < points.length; i++) {
    c.beginPath();
    c.arc(points[i].x,points[i].y, 10 * unit, 0,2 * Math.PI);
    c.fill();
  }
}