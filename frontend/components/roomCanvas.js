
// Global variables
var stage;
var layer;
var containerEl;
var furnitureData = [];
var draggedItem = null;

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
}

function initKonva() {
  var width = containerEl.clientWidth;
  var height = containerEl.clientHeight;

  stage = new Konva.Stage({
    container: 'konva-holder',
    width: width,
    height: height,
  }); //x

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
}

// Load furniture data from JSON
function loadFurnitureData() {
  fetch('../../backend/resources/furniture2D.JSON')
    .then(response => response.json())
    .then(data => {
      furnitureData = data;
      populateFurniturePanel();
    })
    .catch(error => {
      console.error('Error loading furniture data:', error);
      var furnitureList = document.getElementById('furniture-list');
      if (furnitureList) {
        furnitureList.innerHTML = '<p style="color: red;">Error loading furniture</p>';
      }
    });
}

// Populate the sidebar with furniture items
function populateFurniturePanel() {
  var furnitureList = document.getElementById('furniture-list');
  furnitureList.innerHTML = '';

  furnitureData.forEach(function (item) {
    var div = document.createElement('div');
    div.className = 'furniture-item';
    div.draggable = true;
    div.innerHTML = '<strong>' + item.name + '</strong><small>' + item.category + '</small>';
    
    div.dataset.furniture = JSON.stringify(item);

    div.addEventListener('dragstart', function (e) {
      draggedItem = item;
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', JSON.stringify(item));
    });

    furnitureList.appendChild(div);
  });
}

// Handle drag over canvas
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  containerEl.style.opacity = '0.8';
}

// Handle drop on canvas
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

// Add a furniture item to the canvas as a draggable Konva image or shape
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
      fill: '#cccccc',
      stroke: '#666666',
      strokeWidth: 2,
      draggable: true,
      name: 'furniture',
    });

    var text = new Konva.Text({
      x: x,
      y: y + furnitureItem.height / 2 - 8,
      text: furnitureItem.name,
      fontSize: 12,
      fontFamily: 'Arial',
      fill: '#333333',
      align: 'center',
      width: furnitureItem.width,
    });

    placeholder.on('mouseover', function () {
      document.body.style.cursor = 'move';
    });
    placeholder.on('mouseout', function () {
      document.body.style.cursor = 'default';
    });

    layer.add(placeholder);
   
    layer.draw();
  };

  imageObj.src = furnitureItem.imagePath;
};