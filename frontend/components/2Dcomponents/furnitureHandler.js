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

// Add a furniture item to the canvas using its 3D model preview
function addFurnitureToCanvas(furnitureItem, x, y) {
  if (!furnitureItem.modelPath || typeof window.renderGltfPreview !== 'function') {
    console.warn('No modelPath or renderer not ready for ' + furnitureItem.name);
    placePlaceholderOnCanvas(furnitureItem, x, y);
    return;
  }

  try {
    window.renderGltfPreview(furnitureItem.modelPath, furnitureItem.width * 2, furnitureItem.height * 2)
      .then(function (dataUrl) {
        placeImageOnCanvas(dataUrl, furnitureItem, x, y);
      })
      .catch(function (err) {
        console.warn('GLTF preview failed for ' + furnitureItem.modelPath, err);
        placePlaceholderOnCanvas(furnitureItem, x, y);
      });
  } catch (err) {
    console.warn('Error calling renderGltfPreview:', err);
    placePlaceholderOnCanvas(furnitureItem, x, y);
  }
}

// Place an image (data URL or path) on the Konva canvas
function placeImageOnCanvas(imageSrc, furnitureItem, x, y) {
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

    // Store furniture data for later 3D rendering
    konvaImage.setAttr('furnitureId', furnitureItem.id);
    konvaImage.setAttr('modelPath', furnitureItem.modelPath || '');

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
    console.warn('Failed to load rendered preview for: ' + furnitureItem.name);
    placePlaceholderOnCanvas(furnitureItem, x, y);
  };

  imageObj.src = imageSrc;
}

// Place a grey placeholder rectangle when 3D preview is unavailable
function placePlaceholderOnCanvas(furnitureItem, x, y) {
  var placeholder = new Konva.Rect({
    x: x,
    y: y,
    width: furnitureItem.width,
    height: furnitureItem.height,
    fill: '#4b5563',
    stroke: '#6b7280',
    strokeWidth: 1,
    draggable: true,
    name: 'furniture',
  });

  placeholder.setAttr('furnitureId', furnitureItem.id);
  placeholder.setAttr('modelPath', furnitureItem.modelPath || '');

  placeholder.on('mouseover', function () {
    document.body.style.cursor = 'move';
    this.strokeEnabled(true);
    this.stroke('blue');
    this.strokeWidth(2);
    layer.draw();
  });

  placeholder.on('mouseout', function () {
    document.body.style.cursor = 'default';
    this.stroke('#6b7280');
    this.strokeWidth(1);
    layer.draw();
  });

  placeholder.on('click', function () {
    selectFurnitureItem(this);
  });

  layer.add(placeholder);
  layer.draw();
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
