
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
  restoreCanvasState();
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

// Restore room and furniture from localStorage ( after returning from 3D view) USE FOR DATABASE STORAGE IN FUTURE
function restoreCanvasState() {
  var savedPoints = localStorage.getItem('roomPoints');
  if (savedPoints) {
    drawPoints = JSON.parse(savedPoints);
    if (drawPoints.length >= 6) {
      roomPolygon = new Konva.Line({
        points: drawPoints,
        fill: '#f0f4ff',
        stroke: '#374151',
        strokeWidth: 2,
        closed: true,
      });
      drawLayer.add(roomPolygon);
      drawLayer.batchDraw();
    }
  }

  var savedFurniture = localStorage.getItem('roomFurniture');
  if (savedFurniture) {
    var items = JSON.parse(savedFurniture);
    // Wait for furnitureData to load so we can match IDs
    var waitForData = setInterval(function () {
      if (furnitureData.length === 0) return;
      clearInterval(waitForData);

      items.forEach(function (item) {
        // Find matching furniture definition
        var def = furnitureData.find(function (f) { return f.modelPath === item.modelPath; });
        if (!def) return;

        // x/y in localStorage is the centre, convert back to top-left
        var topX = item.x - (item.width || def.width) / 2;
        var topY = item.y - (item.height || def.height) / 2;

        addFurnitureToCanvas(def, topX, topY);
      });
    }
    , 100);
  }



}
