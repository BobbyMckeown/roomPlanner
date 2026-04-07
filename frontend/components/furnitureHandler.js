// ── Furniture handling: drag-drop, placement, selection, deletion ──
// Depends on globals: containerEl, draggedItem, layer (declared in roomCanvas.js)

// Global variable to track selected furniture
var selectedFurniture = null;

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

    konvaImage.on('click', function () {
      selectFurnitureItem(this);
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

// Select a furniture item (visual feedback with red border)
function selectFurnitureItem(konvaShape) {
  if (selectedFurniture) {
    selectedFurniture.strokeEnabled(false);
  }
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
}
