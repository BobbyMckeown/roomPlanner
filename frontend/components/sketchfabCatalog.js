(function () {
  var API_TOKEN = "6bc0ca031112404f9d897d53b68e809d";
  var SEARCH_URL = "https://api.sketchfab.com/v3/search";
  var DOWNLOAD_URL = "https://api.sketchfab.com/v3/models";

  // ── Open catalog modal ──
  document.getElementById("btn-sketchfab").addEventListener("click", openModal);

  function openModal() {
    var overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    overlay.innerHTML =
      '<div class="modal-box sfab-modal">' +
        '<h3 class="modal-title">Browse Sketchfab Models</h3>' +

        '<div class="sfab-search-row">' +
          '<input id="sfab-q" class="modal-input" placeholder="Search (e.g. chair, table)" value="furniture" />' +
          '<button id="sfab-go" class="btn btn-primary sfab-search-btn">Search</button>' +
        '</div>' +

        '<div id="sfab-grid" class="sfab-grid"></div>' +
        '<div id="sfab-pages" class="sfab-pages"></div>' +

        '<div class="modal-actions">' +
          '<button id="sfab-close" class="btn btn-link">Close</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    // Close handlers
    document.getElementById("sfab-close").onclick = function () {
      overlay.remove();
    };
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.remove();
    });

    // Search handlers
    document.getElementById("sfab-go").onclick = function () {
      search(document.getElementById("sfab-q").value.trim());
    };
    document.getElementById("sfab-q").addEventListener("keydown", function (e) {
      if (e.key === "Enter") search(this.value.trim());
    });
  }

  // ── Search Sketchfab API ──
  function search(query, cursor) {
    if (!query) return;

    var grid = document.getElementById("sfab-grid");
    grid.innerHTML = '<p class="sfab-message">Searching...</p>';

    var url = SEARCH_URL +
      "?type=models&downloadable=true" +
      "&q=" + encodeURIComponent(query) +
      "&count=12";

    if (cursor) {
      url += "&cursor=" + encodeURIComponent(cursor);
    }

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) { renderResults(data, query); })
      .catch(function () {
        grid.innerHTML = '<p class="sfab-message sfab-error">Search failed</p>';
      });
  }

  // ── Render search results ──
  function renderResults(data, query) {
    var grid = document.getElementById("sfab-grid");
    grid.innerHTML = "";

    if (!data.results || !data.results.length) {
      grid.innerHTML = '<p class="sfab-message">No results</p>';
      return;
    }

    data.results.forEach(function (model) {
      var thumb = getThumbnail(model);
      var card = createCard(model, thumb);
      grid.appendChild(card);
    });

    renderPagination(data, query);
  }

  // ── Extract thumbnail URL from model data ──
  function getThumbnail(model) {
    if (!model.thumbnails || !model.thumbnails.images) return "";

    var imgs = model.thumbnails.images.sort(function (a, b) {
      return a.width - b.width;
    });

    var pick = imgs.find(function (i) { return i.width >= 200; }) || imgs[imgs.length - 1];
    return pick.url;
  }

  // ── Build a single result card ──
  function createCard(model, thumbUrl) {
    var card = document.createElement("div");
    card.className = "sfab-card";

    var author = model.user ? model.user.displayName : "?";

    card.innerHTML =
      '<img class="sfab-thumb" src="' + thumbUrl + '" alt="' + model.name + '" />' +
      '<div class="sfab-card-info">' +
        '<div class="sfab-card-name">' + model.name + '</div>' +
        '<div class="sfab-card-author">by ' + author + '</div>' +
      '</div>' +
      '<button class="btn btn-primary sfab-add-btn">Add to Room</button>';

    card.querySelector("button").onclick = function () {
      addModel(model);
    };

    return card;
  }

  // ── Render prev / next pagination ──
  function renderPagination(data, query) {
    var pages = document.getElementById("sfab-pages");
    pages.innerHTML = "";

    if (data.cursors && data.cursors.previous) {
      var prevBtn = document.createElement("button");
      prevBtn.className = "btn btn-dark sfab-page-btn";
      prevBtn.textContent = "Prev";
      prevBtn.onclick = function () { search(query, data.cursors.previous); };
      pages.appendChild(prevBtn);
    }

    if (data.cursors && data.cursors.next) {
      var nextBtn = document.createElement("button");
      nextBtn.className = "btn btn-primary sfab-page-btn";
      nextBtn.textContent = "Next";
      nextBtn.onclick = function () { search(query, data.cursors.next); };
      pages.appendChild(nextBtn);
    }
  }

  // ── Download GLB and add model to the 2D canvas ──
  function addModel(model) {
    fetch(DOWNLOAD_URL + "/" + model.uid + "/download", {
      headers: { Authorization: "Token " + API_TOKEN }
    })
      .then(function (r) {
        if (!r.ok) throw new Error("Download failed (" + r.status + ")");
        return r.json();
      })
      .then(function (d) {
        var archive = d.glb || d.gltf;
        if (!archive || !archive.url) {
          alert("No GLB available for this model.");
          return;
        }

        var def = {
          id: "sfab_" + model.uid,
          name: model.name,
          category: "sketchfab",
          width: 80,
          height: 80,
          modelPath: archive.url
        };

        var cx = stage ? stage.width() / 2 - 40 : 200;
        var cy = stage ? stage.height() / 2 - 40 : 200;

        addFurnitureToCanvas(def, cx, cy);
      })
      .catch(function (e) {
        alert(e.message);
      });
  }
})();
