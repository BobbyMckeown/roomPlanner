// ── Sidebar panel: loads furniture JSON and builds collapsible categories ──
// Depends on global: draggedItem (declared in roomCanvas.js)

// Load furniture data from JSON
function loadFurnitureData() {
  fetch('../../backend/resources/furniture2D.JSON')
    .then(function (response) { return response.json(); })
    .then(function (data) {
      furnitureData = data;
      populateFurniturePanel();
    })
    .catch(function (error) {
      console.error('Error loading furniture data:', error);
    });
}

// Populate the sidebar with collapsible furniture categories
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
      div.dataset.furniture = JSON.stringify(item);

      var thumb = document.createElement('img');
      thumb.className = 'furniture-thumb';
      thumb.alt = item.name;
      thumb.src = '';
      div.appendChild(thumb);

      // Render a small preview thumbnail from the 3D model
      if (item.modelPath && typeof window.renderGltfPreview === 'function') {
        window.renderGltfPreview(item.modelPath, 128, 128, true)
          .then(function (dataUrl) { thumb.src = dataUrl; })
          .catch(function () { thumb.style.display = 'none'; });
      } else {
        thumb.style.display = 'none';
      }

      var label = document.createElement('span');
      label.className = 'furniture-label';
      label.textContent = item.name;
      div.appendChild(label);

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
