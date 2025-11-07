var stage = new Konva.Stage({ //creating a konva stage
    container: "konva-holder", 
    width: window.innerWidth,  
    height: window.innerHeight,
});

var layer = new Konva.Layer(); //creating a konva layer

var circle = new Konva.Circle({
    x: stage.width() / 2,
    y: stage.height() / 2,
    radius: 70,
    fill: "red",
    stroke: "black",
    strokeWidth: 4,
    
    draggable: true, //allowing the circle to be draggable with the right trigger

})


circle.on('mouseover', function () {
  document.body.style.cursor = 'pointer';
});  //user has pressed mouse over the circle
circle.on('mouseout', function () {
  document.body.style.cursor = 'default';
}); //user no longer holding mouse on the shape


layer.add(circle); //adding circle to layer 
stage.add(layer); //adding layer to stage

