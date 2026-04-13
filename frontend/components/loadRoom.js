(function () {
  var API = "http://localhost:5000/api";
  var btnLoad = document.getElementById("btn-load-room");
  if (!btnLoad) return;

  btnLoad.addEventListener("click", function () {
    console.log('[LoadRoom] Load Room button clicked');
    var user = JSON.parse(localStorage.getItem("roomPlannerUser"));
    if (!user) {
      alert("Please login to load your saved rooms.");
      console.log('[LoadRoom] No user logged in');
      return;
    }
    console.log('[LoadRoom] Fetching rooms for user', user.id);
    fetch(API + "/roomsaves/user/" + user.id)
      .then(function (res) { return res.json(); })
      .then(function (rooms) {
        console.log('[LoadRoom] Rooms fetched:', rooms);
        showRoomListModal(rooms);
      })
      .catch(function (err) {
        alert("Failed to fetch saved rooms.");
        console.error('[LoadRoom] Fetch error:', err);
      });
  });

  function showRoomListModal(rooms) {
    console.log('[LoadRoom] Showing room list modal', rooms);
    var overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    var html = '<div class="modal-box"><h3 class="modal-title">Select a Saved Room</h3>';
    if (!rooms.length) {
      html += '<p>No saved rooms found.</p>';
    } else {
      html += '<ul class="room-list">';
      rooms.forEach(function (room) {
        html += '<li><button class="btn btn-link room-load-btn" data-id="' + room.id + '">' +
          room.roomName + ' <span style="font-size:0.8em;color:#888">(' + (room.savedAt ? room.savedAt.split("T")[0] : "") + ')</span></button></li>';
      });
      html += '</ul>';
    }
    html += '<div class="modal-actions"><button id="close-room-modal" class="btn btn-link">Cancel</button></div></div>';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    document.getElementById("close-room-modal").onclick = function () { overlay.remove(); };
    overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.remove(); });

    var btns = overlay.querySelectorAll(".room-load-btn");
    btns.forEach(function (btn) {
      btn.onclick = function () {
        var room = rooms.find(function (r) { return r.id == btn.getAttribute("data-id"); });
        console.log('[LoadRoom] Room selected:', room);
        if (!room) {
          console.warn('[LoadRoom] No room found for button');
          return;
        }
        try {
          var data = JSON.parse(room.roomData);
          console.log('[LoadRoom] Parsed room data:', data);
          localStorage.setItem("roomPoints", JSON.stringify(data.roomPoints || []));
          localStorage.setItem("roomFurniture", JSON.stringify(data.roomFurniture || []));
          if (window.restoreCanvasState) {
            console.log('[LoadRoom] Calling restoreCanvasState');
            window.restoreCanvasState();
          } else {
            console.warn('[LoadRoom] restoreCanvasState not found, reloading');
            location.reload();
          }
        } catch (e) {
          alert("Failed to load room data.");
          console.error('[LoadRoom] Error parsing room data:', e);
        }
        overlay.remove();
      };
    });
  }
})();
