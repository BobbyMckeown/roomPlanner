
// Global variables
var stage;
var layer;
var drawLayer;
var containerEl;
var furnitureData = [];
var draggedItem = null;
var isDrawing = false;
var drawPoints = [];
var drawLine = null;
var drawDots = [];
var roomPolygon = null;

// Initialize when DOM is ready
var container = document.getElementById('konva-holder');
if (!container) {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  containerEl = container || document.getElementById('konva-holder');
  initKonva();
  loadFurnitureData();
  initButtons();
}

function initKonva() {
  var width = containerEl.clientWidth;
  var height = containerEl.clientHeight;

  stage = new Konva.Stage({
    container: 'konva-holder',
    width: width,
    height: height,
  });

  drawLayer = new Konva.Layer();
  stage.add(drawLayer);

  layer = new Konva.Layer();
  stage.add(layer);

  window.addEventListener('resize', function () {
    var w = containerEl.clientWidth;
    var h = containerEl.clientHeight;
    stage.width(w);
    stage.height(h);
    stage.batchDraw();
  });

  containerEl.addEventListener('dragover', handleDragOver);
  containerEl.addEventListener('drop', handleDrop);

  window.addEventListener('keydown', function (e) {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFurniture) {
      deleteFurnitureItem(selectedFurniture);
    }
  });
}



