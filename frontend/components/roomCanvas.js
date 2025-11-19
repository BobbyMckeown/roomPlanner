
// create the Konva stage sized to the container element
var container = document.getElementById('konva-holder');
//
if (!container) {
  document.addEventListener('DOMContentLoaded', function () {
    initKonva();
  });
} else {
  initKonva();
}

function initKonva() {
  var containerEl = container || document.getElementById('konva-holder');
  var width = containerEl.clientWidth;
  var height = containerEl.clientHeight;

  var stage = new Konva.Stage({
    container: 'konva-holder',
    width: width,
    height: height,
  });

  var layer = new Konva.Layer();

  

  var circle = new Konva.Circle({
    x: stage.width() / 2,
    y: stage.height() / 2,
    radius: Math.min(stage.width(), stage.height()) * 0.12, // scale radius to container
    fill: 'red',
    stroke: 'black',
    strokeWidth: 4,
    draggable: true,
  });

  var triangle = new Konva.RegularPolygon({
    x: stage.width() / 2,
    y: stage.height() / 2 + 150,
    sides: 3,
    radius: 50,
    fill: 'blue',
    stroke: 'black',
    strokeWidth: 4,
    draggable: true,
  });

  circle.on('mouseover', function () {
    document.body.style.cursor = 'pointer';
  });
  circle.on('mouseout', function () {
    document.body.style.cursor = 'default';
  });

  layer.add(circle);
  layer.add(triangle);
  stage.add(layer);

  // keep the stage sized to the container on window resize
  window.addEventListener('resize', function () {
    var w = containerEl.clientWidth;
    var h = containerEl.clientHeight;
    stage.width(w);
    stage.height(h);

    // recenter and resize the circle a bit
    circle.position({ x: stage.width() / 2, y: stage.height() / 2 });
    circle.radius(Math.min(stage.width(), stage.height()) * 0.12);
    stage.batchDraw();
  })};