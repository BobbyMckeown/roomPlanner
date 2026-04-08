// ── Room-draw mode ──
function initButtons() {
  var btnDraw = document.getElementById('btn-draw');
  var btnReset = document.getElementById('btn-reset');

  btnDraw.addEventListener('click', function () {
    if (isDrawing) return;
    isDrawing = true;
    btnDraw.classList.add('active');
    stage.container().style.cursor = 'crosshair';

    stage.on('click.draw', function (e) {
      var pos = stage.getPointerPosition();

      // Close polygon when clicking near the first point
      if (drawPoints.length >= 6) {
        var dx = pos.x - drawPoints[0];
        var dy = pos.y - drawPoints[1];
        if (Math.sqrt(dx * dx + dy * dy) < 12) {
          finishDrawing();
          return;
        }
      }

      drawPoints.push(pos.x, pos.y);

      // Visual dot
      var dot = new Konva.Circle({
        x: pos.x,
        y: pos.y,
        radius: 4,
        fill: '#3b82f6',
      });
      drawLayer.add(dot);
      drawDots.push(dot);

      // Connecting line
      if (drawLine) drawLine.destroy();
      drawLine = new Konva.Line({
        points: drawPoints,
        stroke: '#3b82f6',
        strokeWidth: 2,
        dash: [6, 3],
      });
      drawLayer.add(drawLine);
      drawLayer.batchDraw();
    });
  });

  btnReset.addEventListener('click', function () {
    resetRoom();
  });
}

function finishDrawing() {
  isDrawing = false;
  stage.off('click.draw');
  stage.container().style.cursor = 'default';
  var btnDraw = document.getElementById('btn-draw');
  btnDraw.classList.remove('active');

  // Remove temp visuals
  drawDots.forEach(function (d) { d.destroy(); });
  drawDots = [];
  if (drawLine) { drawLine.destroy(); drawLine = null; }

  // Draw filled room polygon
  roomPolygon = new Konva.Line({
    points: drawPoints,
    fill: '#f0f4ff',
    stroke: '#374151',
    strokeWidth: 2,
    closed: true,
  });
  drawLayer.add(roomPolygon);
  drawLayer.batchDraw();
}

function resetRoom() {
  isDrawing = false;
  stage.off('click.draw');
  stage.container().style.cursor = 'default';
  var btnDraw = document.getElementById('btn-draw');
  btnDraw.classList.remove('active');

  drawPoints = [];
  drawDots.forEach(function (d) { d.destroy(); });
  drawDots = [];
  if (drawLine) { drawLine.destroy(); drawLine = null; }
  if (roomPolygon) { roomPolygon.destroy(); roomPolygon = null; }
  drawLayer.destroyChildren();
  layer.destroyChildren();
  drawLayer.batchDraw();
  layer.batchDraw();
  selectedFurniture = null;

  // Clear saved state
  localStorage.removeItem('roomPoints');
  localStorage.removeItem('roomFurniture');
}