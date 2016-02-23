var pago, scaleFactor;

function initCanvas() {

  var canvas = document.getElementById("myCanvas");

  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 40;
}

function newFile(file) {
  getPolygonAndGuards(file, function(pag) {
    pago = pag;
    drawEverything(pag);
  });
}

function newMap() {
  drawEverything(pago);
}

function drawEverything(pag) {
  var canvas = document.getElementById("myCanvas");
  var c = canvas.getContext('2d');

  var mapId = parseInt(document.getElementById("mapId").value) - 1;
  c.setTransform(1,0,0,1,0,0);
  c.clearRect(0,0, canvas.width, canvas.height);

  scaleCanvas(c, pag[mapId].polygon);

  drawPolygon(c, pag[mapId].polygon.vertices);

  // draw triangles
  var triangles = pag[mapId].polygon.findEars(); 
  for( var index = 0 ; index < triangles.length ; index++ )
  {
    var ear = triangles[index];
    c.beginPath();
    c.moveTo(pag[mapId].polygon.vertices[ear[0]].x, pag[mapId].polygon.vertices[ear[0]].y);
    c.lineTo(pag[mapId].polygon.vertices[ear[1]].x, pag[mapId].polygon.vertices[ear[1]].y);
    c.lineTo(pag[mapId].polygon.vertices[ear[2]].x, pag[mapId].polygon.vertices[ear[2]].y);
    c.closePath();
    c.lineWidth=0.001 * 150 / scaleFactor;
    c.stroke();
  }

  // draw visibility polygon
  var visibilityPolygon = fullVisibilityPolygon(pag[mapId].polygon, [pag[mapId].guards[0]]);
  console.log(visibilityPolygon[0]);
  drawPolygon(c, visibilityPolygon[0], "rgba(255, 255, 0, 0.25)");

  pag[mapId].polygon.printGuardPositions();
  drawColoredVertices(c, pag[mapId].polygon);

  drawGuardPoints(c, [pag[mapId].guards[0]]);

  // draw origin
  c.fillStyle = 'yellow';
  c.beginPath();
  c.arc(0,0,0.025,0,2*Math.PI);
  c.fill();
}

function scaleCanvas(c, polygon) {
  var scaleFactorX = document.getElementById("myCanvas").offsetWidth / polygon.rangeX;
  var scaleFactorY = document.getElementById("myCanvas").offsetHeight / polygon.rangeY;
  scaleFactor = Math.min(scaleFactorX, scaleFactorY);
  c.scale(scaleFactor, -scaleFactor);
  c.translate(-polygon.minX, -polygon.minY - polygon.rangeY);
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
    c.arc(vertex.x,vertex.y,0.1,0,2*Math.PI);
    c.fill();
  }
}

function drawGuardPoints(c, points) {
  c.fillStyle = 'black';
  for(var i = 0; i < points.length; i++) {
    c.beginPath();
    c.arc(points[i].x,points[i].y,0.05,0,2*Math.PI);
    c.fill();
  }
}