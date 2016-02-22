var minMax = function(points) {
  var allX = [];
  var allY = [];
  for(var i = 0; i < points.length; i++) {
    allX.push(points[i].x);
    allY.push(points[i].y);
  }
  this.minX = Math.min(...allX);
  this.minY = Math.min(...allY);
  this.maxX = Math.max(...allX);
  this.maxY = Math.max(...allY);
  this.rangeX = this.maxX - this.minX;
  this.rangeY = this.maxY - this.minY;
}

function initCanvas() {

  var canvas = document.getElementById("myCanvas");

  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 10;
  canvas.style.backgroundColor = "slategray";

  //var pag = getPolygonAndGuards(fileName);

  //var pag = [new CheckablePolygon([new Point(-100,100), new Point(0,200), new Point(100,0)], [new Point(0,0), new Point(0,2), new Point(1,0)])]
  //drawPolygon(pag[0].vertices)
  
}

function newFile(file) {
  getPolygonAndGuards(file, function(pag) {
    console.log(JSON.stringify(pag[17]))
    drawEverything(pag);
  });
}

function drawEverything(pag) {
  var canvas = document.getElementById("myCanvas");
  var c = canvas.getContext('2d');
  scaleCanvas(c, pag[17].vertices);
  drawPolygon(c, pag[17].vertices);
}

function scaleCanvas(c, points) {
  var minMaxPoints = new minMax(points);
  var scaleFactorX = 0;
  var scaleFactorY = 0;
  scaleFactorX = document.getElementById("myCanvas").offsetWidth / minMaxPoints.rangeX;
  scaleFactorY = document.getElementById("myCanvas").offsetHeight / minMaxPoints.rangeY;
  var scaleFactor = Math.min(scaleFactorX, scaleFactorY);
  c.scale(scaleFactor, scaleFactor);
  c.translate(-minMaxPoints.minX, -minMaxPoints.minY);
  console.log(JSON.stringify(minMaxPoints))
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