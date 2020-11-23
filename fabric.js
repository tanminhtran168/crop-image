var canvas = new fabric.Canvas('c1');

canvas.set('angle', 45);
//add the image and set the properties
var imgElement = document.getElementById('my-image');
var object = new fabric.Image(imgElement, {
  width: 600,
  height: 400,
  left: 700,
  top: 300,
  opacity: 0.85,
  selectable: false,
});
canvas.add(object);
object.set('originX', 'center');
object.set('originY', 'center');

//add the selection boundary and set properties  
var selection = new fabric.Rect({
    height: 400,
    width: 600,
    top: 300,
    left: 700,
    stroke: 'green',
    strokeDashArray: [3, 1],
    strokeWidth: 3,
    fill: 'transparent'
});
canvas.add(selection);

var selection1 = new fabric.Rect({
    height: 400,
    width: 600,
    top: 300,
    left: 700,
    stroke: 'green',
    strokeDashArray: [3, 1],
    strokeWidth: 3,
    fill: 'transparent',
    visible: false,
    selectable: false
});
canvas.add(selection1);

canvas.item(1).hasBorders = false;
canvas.item(1).set({
    cornerColor: 'green',
    cornerSize: 20,
    rotatingPointOffset: 80,
    transparentCorners: false
  });

selection.set('originX', 'center');
selection.set('originY', 'center');

selection1.set('originX', 'center');
selection1.set('originY', 'center');
//read the position of the selection boundary while scaling
var left, _top, width, heightm, angle = 0;
canvas.on('object:scaling', function(options){
    if (options.target) {
        var target = options.target;
        console.log('left', target.left, 'top', target.top, 'width', target.getScaledWidth(), 'height', target.getScaledHeight());
        left = target.left;
        _top = target.top;
        width = target.getScaledWidth();
        height = target.getScaledHeight();
    }
});

//read the position of the selection boundary while moving
canvas.on('object:moving', function(options){
    if (options.target) {
        var target = options.target;
        console.log('left', target.left, 'top', target.top, 'width', target.getScaledWidth(), 'height', target.getScaledHeight());
        left = target.left;
        _top = target.top;
        width = target.getScaledWidth();
        height = target.getScaledHeight();
    }
});
var cropLeft, cropTop; // declare the parameters for the crop function ctx.rect(left, top, width, height)
var pi = Math.PI; 

//crop the image according to the selection boundary
function crop() { 
    if (angle == 0) {

        console.log('selection.angle = ', selection.angle);
        object.set('clipTo', function (ctx) {
            cropLeft = (left - object.left) - (width)/2;
            cropTop = (_top - object.top) - (height)/2;
            ctx.rect(cropLeft, cropTop, width, height);
        });
        canvas.renderAll();
    }
};

//resize the image according to the selection boundary
var preWidth, preHeight, preLeft, preTop, preAngle = 0;         // declare the previous state of the respective properties
function resize() {
    console.log('RESIZE');

    if (left - width/2 < object.left - object.width/2) {       
        object.width = (object.width + preLeft - preWidth/2 - left + width/2)*width/preWidth;
        object.height = object.width/1.5;
    }
    if (_top - height/2 < object.top - object.height/2) {
        object.height = (object.height + preTop - preHeight/2 - _top + height/2)*height/preHeight;
        object.width = object.height*1.5;
    }

    //zoom-in the image 
    if (height < preHeight) {
        object.height *= height/preHeight;
        object.width *= height/preHeight;
    }
    if (width < preWidth) {
        object.width *= width/preWidth;
        object.height *= width/preWidth;
    }
    
    //zoom-out and expand the image
    if (object.width < width) {                                             //expand the width
        object.height *= (width/2 + left)/object.width;
        object.width = width/2 + left;
    } else if (object.width/2 + object.left < left + width/2) {                 //zoom-out the width
        object.height *= (left + width/2 - object.left + object.width/2) / object.width;
        object.width = left + width/2 - object.left + object.width/2;
    }
        
    if (object.height < height) {                                           //expand the height
        object.width *= (height/2 + _top)/object.height;
        object.height = height/2 + _top;
    } else if (object.height/2 + object.top < _top + height/2) {                //zoom-out the height
        object.width *= (_top + height/2 - object.top + object.height/2) / object.height;
        object.height = _top + height/2 - object.top + object.height/2;
    }
    
    //rectify the errors while the selection boundary exceeds the left(top) boundary of the image
    if (left - width/2 < object.left - object.width/2) {       
        object.width = (object.width + preLeft - preWidth/2 - left + width/2)*width/preWidth;
        object.height = object.width/1.5;
        object.left = left;
    }
    if (_top - height/2 < object.top - object.height/2) {
        object.height = (object.height + preTop - preHeight/2 - _top + height/2)*height/preHeight;
        object.width = object.height*1.5;
        object.top = _top;
    }
   
    
    //save the previous value of the properties
    preWidth = width;
    preHeight = height;
    preLeft = left;
    preTop = _top;
    preAngle = selection.angle;
};
var addLeft, addTop;            

//declare the differences of left and top properties while rotate 
function rotate() {

    console.log('ROTATE');

    canvas.item(1).setControlVisible('tl', false);
    canvas.item(1).setControlVisible('tr', false);
    canvas.item(1).setControlVisible('bl', false);
    canvas.item(1).setControlVisible('br', false);
    selection.set('opacity', 0);
    selection.set('selectable', false);
    object.set('selectable', true);
    // canvas.item(1).set({
    //     rotatingPointOffset: _top - 450
    // })
    

    selection1.set('top', 2*object.top - _top);
    selection1.set('left', object.left);
    selection1.set('width', width);
    selection1.set('height', height);

    selection1.angle = selection.angle;

    selection1.set('visible', true);

    object.angle = selection.angle;

    preAngle = selection.angle;
    canvas.renderAll();
};
$('#cropB').on('click', crop);

$('#cropB').on('click', function () {
    canvas.on('object:scaling', resize);
});
$('#cropB').on('click', function () {
    canvas.on('object:moving', resize);
});
$('#cropB').on('click', function () {
    canvas.on('object:rotating', rotate);
});
