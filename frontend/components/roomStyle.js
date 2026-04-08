// ── Room Style: wall & floor colour pickers ──

(function () {
  var wallInput = document.getElementById('wall-colour');
  var floorInput = document.getElementById('floor-colour');

  // Load saved colours
  var savedWall = localStorage.getItem('wallColour');
  var savedFloor = localStorage.getItem('floorColour');
  if (savedWall) wallInput.value = savedWall;
  if (savedFloor) floorInput.value = savedFloor;

  // Save on change
  wallInput.addEventListener('input', function () {
    localStorage.setItem('wallColour', wallInput.value);
  });
  floorInput.addEventListener('input', function () {
    localStorage.setItem('floorColour', floorInput.value);
  });
})();
