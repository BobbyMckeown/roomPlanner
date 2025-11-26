
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
  }); //creating kova stage object

  layer = new Konva.Layer();
  stage.add(layer);

  window.addEventListener('resize', function () {
    var w = containerEl.clientWidth;
    var h = containerEl.clientHeight;
    stage.width(w);
    stage.height(h);
    stage.batchDraw();
  }); //handles window resize *required for furniture boxes

  containerEl.addEventListener('dragover', handleDragOver);
  containerEl.addEventListener('drop', handleDrop);//drag and drop functions 
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

//populate the sidebar with furniture items
function populateFurniturePanel() {
  var furnitureList = document.getElementById('furniture-list');
  furnitureList.innerHTML = '';

  furnitureData.forEach(function (item) {
    var div = document.createElement('div'); //create a div for each furniture item
    div.className = 'furniture-item';//div. allows for styling as we create the div
    div.draggable = true;
    div.innerHTML = item.name +" "+item.category; //displays name and category on the side bar
    
    div.dataset.furniture = JSON.stringify(item); //creates a data set that can be looked up again 
    //makes it so the program will only loop through items once started 

    div.addEventListener('dragstart', function (e) { //function to handle drag and drop while keeping data on each varient created 
      draggedItem = item; 
      e.dataTransfer.effectAllowed = 'copy'; // creates a copy of the item being dragged
      e.dataTransfer.setData('text/plain', JSON.stringify(item));
    });

    furnitureList.appendChild(div);
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
    });
    placeholder.on('mouseout', function () {
      document.body.style.cursor = 'default';
    });

    layer.add(placeholder);
   
    layer.draw();
  };

  imageObj.src = furnitureItem.imagePath;
};