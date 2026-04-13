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

    var roomData = JSON.stringify({
      roomPoints: JSON.parse(localStorage.getItem("roomPoints") || "[]"),
      roomFurniture: JSON.parse(localStorage.getItem("roomFurniture") || "[]"),
      wallColour: localStorage.getItem("wallColour") || "#c0c0c0",
      floorColour: localStorage.getItem("floorColour") || "#8b4513"
    });

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
