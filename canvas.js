var pago;

function initCanvas() {

  var canvas = document.getElementById("myCanvas");

  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 40;



  //var pag = getPolygonAndGuards(fileName);

  //var pag = [new CheckablePolygon([new Point(-100,100), new Point(0,200), new Point(100,0)], [new Point(0,0), new Point(0,2), new Point(1,0)])]
  //drawPolygon(pag[0].vertices)
  
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
  drawGuardPoints(c, pag[mapId].guards);

  pag[mapId].polygon.printGuardPositions();
  drawColoredVertices(c, pag[mapId].polygon);

  // draw origin
  
  c.fillStyle = 'yellow';
  c.beginPath();
  c.arc(0,0,0.05,0,2*Math.PI);
  c.fill();
}

function scaleCanvas(c, polygon) {
  var scaleFactorX = document.getElementById("myCanvas").offsetWidth / polygon.rangeX;
  var scaleFactorY = document.getElementById("myCanvas").offsetHeight / polygon.rangeY;
  var scaleFactor = Math.min(scaleFactorX, scaleFactorY);
  c.scale(scaleFactor, -scaleFactor);
  c.translate(-polygon.minX, -polygon.minY - polygon.rangeY);
  console.log(JSON.stringify(polygon))
  console.log(scaleFactor)
}

function drawPolygon(c, points) {
  c.fillStyle = '#ffffff';
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
  c.fillStyle = 'red';
  for(var i = 0; i < points.length; i++) {
    c.beginPath();
    c.arc(points[i].x,points[i].y,0.1,0,2*Math.PI);
    c.fill();
  }
}