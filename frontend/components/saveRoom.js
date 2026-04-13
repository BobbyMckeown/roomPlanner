(function () {
  var API = "http://localhost:5000/api";

  document.getElementById("btn-save-room").addEventListener("click", function () {
    var currentUser = JSON.parse(localStorage.getItem("roomPlannerUser"));

    if (!currentUser) {
      alert("Please login first to save a room.");
      return;
    }

    var roomName = prompt("Enter a name for this room:");
    if (!roomName) return;


    // Gather room data to save
    // 1. Room points
    var points = (typeof drawPoints !== 'undefined' && drawPoints.length) ? drawPoints.slice() : [];

    // 2. Furniture
    var furniture = [];
    if (typeof layer !== 'undefined' && layer && typeof layer.find === 'function') {
      layer.find('.furniture').forEach(function(node) {
        furniture.push({
          x: node.x() + node.width() / 2,
          y: node.y() + node.height() / 2,
          width: node.width(),
          height: node.height(),
          modelPath: node.getAttr('modelPath')
        });
      });
    }

    // 3. Wall/floor colours
    var wallColour = localStorage.getItem("wallColour") || "#c0c0c0";
    var floorColour = localStorage.getItem("floorColour") || "#8b4513";

    var roomData = JSON.stringify({
      roomPoints: points,
      roomFurniture: furniture,
      wallColour: wallColour,
      floorColour: floorColour
    });

    console.log('[SaveRoom] Saving room:', { points, furniture, wallColour, floorColour });

    fetch(API + "/roomsaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, roomName: roomName, roomData: roomData })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.error) { alert(data.error); return; }
        alert("Room saved!");
      })
      .catch(function () { alert("Cannot reach server."); });
  });
})();
