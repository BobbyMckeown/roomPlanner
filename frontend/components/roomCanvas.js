var stage = new konva.Stage({ //creating a konva stage
    container: "konva-holder", 
    Width: window.innerWidth,  
    height: window.innerHeight,
});

var layer = new konva.Layer(); //creating a konva layer

var circle = new konva.circle({
    x: stage.width() / 2,
    y: stage.height() / 2,
    radius: 70,
    fill: "red",
    stroke: "black",
    strokeWidth: 4,

})

layer.add(circle); //adding circle to layer 
stage.add(layer); //adding layer to stage