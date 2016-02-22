function initCanvas() {

  console.log("lol")

  var canvas = document.getElementById("myCanvas");

  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.backgroundColor = "slategray";

  var filename = "";

  //var pag = getPolygonAndGuards(fileName);

  var pag = [new CheckablePolygon([new Coordinate(0,0), new Coordinate(0,2), new Coordinate(1,0)], [new Coordinate(0,0), new Coordinate(0,2), new Coordinate(1,0)])]

  var c = canvas.getContext('2d');
  c.fillStyle = '#f00';
  c.beginPath();

  c.moveTo(pag.verticies[0].x, pag.verticies[0].y);
  var i = 1;
  for(i = 1; i < pag.verticies-1; i++) {

  }
}