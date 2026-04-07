
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

// ── Room-draw mode ──
function initButtons() {
  var btnDraw = document.getElementById('btn-draw');
  var btnReset = document.getElementById('btn-reset');

  btnDraw.addEventListener('click', function () {
    if (isDrawing) return;
    isDrawing = true;
    btnDraw.classList.add('active');
    stage.container().style.cursor = 'crosshair';

    stage.on('click.draw', function (e) {
      var pos = stage.getPointerPosition();

      // Close polygon when clicking near the first point
      if (drawPoints.length >= 6) {
        var dx = pos.x - drawPoints[0];
        var dy = pos.y - drawPoints[1];
        if (Math.sqrt(dx * dx + dy * dy) < 12) {
          finishDrawing();
          return;
        }
      }

      drawPoints.push(pos.x, pos.y);

      // Visual dot
      var dot = new Konva.Circle({
        x: pos.x,
        y: pos.y,
        radius: 4,
        fill: '#3b82f6',
      });
      drawLayer.add(dot);
      drawDots.push(dot);

      // Connecting line
      if (drawLine) drawLine.destroy();
      drawLine = new Konva.Line({
        points: drawPoints,
        stroke: '#3b82f6',
        strokeWidth: 2,
        dash: [6, 3],
      });
      drawLayer.add(drawLine);
      drawLayer.batchDraw();
    });
  });

  btnReset.addEventListener('click', function () {
    resetRoom();
  });
}

function finishDrawing() {
  isDrawing = false;
  stage.off('click.draw');
  stage.container().style.cursor = 'default';
  var btnDraw = document.getElementById('btn-draw');
  btnDraw.classList.remove('active');

  // Remove temp visuals
  drawDots.forEach(function (d) { d.destroy(); });
  drawDots = [];
  if (drawLine) { drawLine.destroy(); drawLine = null; }

  // Draw filled room polygon
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

function resetRoom() {
  isDrawing = false;
  stage.off('click.draw');
  stage.container().style.cursor = 'default';
  var btnDraw = document.getElementById('btn-draw');
  btnDraw.classList.remove('active');

  drawPoints = [];
  drawDots.forEach(function (d) { d.destroy(); });
  drawDots = [];
  if (drawLine) { drawLine.destroy(); drawLine = null; }
  if (roomPolygon) { roomPolygon.destroy(); roomPolygon = null; }
  drawLayer.destroyChildren();
  layer.destroyChildren();
  drawLayer.batchDraw();
  layer.batchDraw();
  selectedFurniture = null;
}

// Load furniture data from JSON
function loadFurnitureData() {
  fetch('../../backend/resources/furniture2D.JSON')
    .then(response => response.json())//parse JSON data
    .then(data => {
      furnitureData = data;
      populateFurniturePanel();//populate sidebar with furniture items
    })
    .catch(error => {
      console.error('Error loading furniture data:', error);
     
    });
}

//populate the sidebar with collapsible furniture categories
function populateFurniturePanel() {
  var container = document.getElementById('furniture-categories');
  container.innerHTML = '';

  // Group items by category
  var categories = {};
  furnitureData.forEach(function (item) {
    var cat = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  Object.keys(categories).forEach(function (catName) {
    var group = document.createElement('div');
    group.className = 'category-group';

    var header = document.createElement('button');
    header.className = 'category-header';
    header.innerHTML = catName + '<span class="category-chevron">&#8250;</span>';

    var itemsDiv = document.createElement('div');
    itemsDiv.className = 'category-items';

    header.addEventListener('click', function () {
      header.classList.toggle('open');
      itemsDiv.classList.toggle('open');
    });

    categories[catName].forEach(function (item) {
      var div = document.createElement('div');
      div.className = 'furniture-item';
      div.draggable = true;
      div.textContent = item.name;
      div.dataset.furniture = JSON.stringify(item);

      div.addEventListener('dragstart', function (e) {
        draggedItem = item;
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', JSON.stringify(item));
      });

      itemsDiv.appendChild(div);
    });

    group.appendChild(header);
    group.appendChild(itemsDiv);
    container.appendChild(group);
  });
}

//Handle drag over canvas
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  containerEl.style.opacity = '0.8';
}

//Handle drop on canvas
function handleDrop(e) {
  e.preventDefault();
  containerEl.style.opacity = '1';

  if (!draggedItem) return;

  var rect = containerEl.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;

  addFurnitureToCanvas(draggedItem, x, y);
  draggedItem = null;
}

//Add a furniture item to the canvas as a draggable Konva image or shape
function addFurnitureToCanvas(furnitureItem, x, y) {
  var imageObj = new Image();
  imageObj.onload = function () {
    var konvaImage = new Konva.Image({
      image: imageObj,
      x: x,
      y: y,
      width: furnitureItem.width,
      height: furnitureItem.height,
      draggable: true,
      name: 'furniture',
    });


    konvaImage.on('click', function () {
      selectFurnitureItem(this);
    }); //identifys item when clicked

    konvaImage.on('mouseover', function () {
      document.body.style.cursor = 'move';
      this.strokeEnabled(true);
      this.stroke('blue');
      this.strokeWidth(2);
      layer.draw();
    });

    konvaImage.on('mouseout', function () {
      document.body.style.cursor = 'default';
      this.strokeEnabled(false);
      layer.draw();
    });

    konvaImage.on('dragend', function () {
      layer.draw();
    });

    layer.add(konvaImage);
    layer.draw();
  };

  imageObj.onerror = function () {
    console.warn('Failed to load image: ' + furnitureItem.imagePath);
    var placeholder = new Konva.Rect({
      x: x,
      y: y,
      width: furnitureItem.width,
      height: furnitureItem.height,
      fill: 'red',
      strokeWidth: 2,
      draggable: true,
      name: 'noimage',
    });

  

    placeholder.on('mouseover', function () {
      document.body.style.cursor = 'move';
      this.strokeEnabled(true);
      this.stroke('blue');
      this.strokeWidth(2);
      layer.draw();
    });
    placeholder.on('mouseout', function () {
      document.body.style.cursor = 'default';
      this.strokeEnabled(false);
      layer.draw();
    });

    placeholder.on('click', function () {
      selectFurnitureItem(this);
    });

    layer.add(placeholder);
   
    layer.draw();
  };

  imageObj.src = furnitureItem.imagePath;
}

// Global variable to track selected furniture
var selectedFurniture = null;

// Select a furniture item (visual feedback with red border)
function selectFurnitureItem(konvaShape) {
  // Deselect previous selection
  if (selectedFurniture) {
    selectedFurniture.strokeEnabled(false);
  }
  
  // Select new item
  selectedFurniture = konvaShape;
  konvaShape.strokeEnabled(true);
  konvaShape.stroke('red');
  konvaShape.strokeWidth(3);
  layer.draw();
}

// Delete selected furniture item
function deleteFurnitureItem(konvaShape) {
  if (!konvaShape) return;
  
  konvaShape.destroy();
  selectedFurniture = null;
  layer.draw();
};