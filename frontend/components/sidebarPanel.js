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
