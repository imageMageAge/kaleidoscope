/*
To do list:
Add user input options -- control animation length, speed, width of animation
Refresh / add a break to stop the animation and allow a new run without refreshing the page
add a button to start/stop animation?
Add a button to delete animation?
Is there some way to allow automated gif or video making from this page?
Improve user menu, add header landing with example carousel, add explanatory notes and link to original post
*/

//image upload variables
var imageInput = document.getElementById('imageInput');
imageInput.addEventListener('change', readSourceImage);
var isImageLoaded = false;
var imageContainer = document.getElementById('imageContainer');
var newImageContainer = document.getElementById('newImageContainer');

var actualWidth;
var actualHeight;

var scaledWidth;
var scaledHeight;
var widthScalingRatio;
var maxImageWidth = 600;

var SqrtOf3_4 = Math.sqrt(3)/2;

//create animation button
const goButton = document.getElementById('createAnimationButton');
goButton.addEventListener('click', createAnimation);

//animation variables
var counter = 0;
var animationSpeed = 50; //larger values give slower animation
var patDim;
var animationWidth;
var animationLength = 600; //larger value give longer animation before restarting loop
var animationStep = 1.5; //larger values give larger movement between animation frames;

function readSourceImage(){

    //remove any existing images
    while (imageContainer.firstChild) {
        imageContainer.removeChild(imageContainer.firstChild);
    }

    while (newImageContainer.firstChild) {
        newImageContainer.removeChild(newImageContainer.firstChild);
    }
        
    //read image file      
    var file = imageInput.files[0];
    var reader = new FileReader();
    reader.onload = (event) => {
        var imageData = event.target.result;
        var image = new Image();
        image.src = imageData;
        image.onload = () => {
          
            actualWidth = image.width;
            actualHeight = image.height;

            //image scaling
            if(actualWidth > maxImageWidth){
                scaledWidth = maxImageWidth;
                widthScalingRatio = scaledWidth / actualWidth;
                scaledHeight = actualHeight * widthScalingRatio;
            } else{
                scaledWidth = actualWidth;
                widthScalingRatio = 1;
                scaledHeight = actualHeight;
            }

            patDim = scaledWidth;
            animationWidth = patDim*2;

            //resize the src variable of the original image
            var newCanvas = document.createElement('canvas');
            newCanvas.width = scaledWidth;
            newCanvas.height = scaledHeight;
            var ctx = newCanvas.getContext('2d');
            ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
        
            var resizedImgSrc = newCanvas.toDataURL();
    
            //draw the resized image onto the page
            var originalImg = document.createElement('img');
            originalImg.setAttribute("id", "originalImg");
            originalImg.src = resizedImgSrc;
            originalImg.width = scaledWidth;
            originalImg.height = scaledHeight;
            imageContainer.appendChild(originalImg);

            setTimeout(generateFlippedImage, 2000); //wait a couple seconds for image resize to happen
            //generateFlippedImage();
   
        };
    };
      
    reader.readAsDataURL(file);
    
    isImageLoaded = true;
    
}

function generateFlippedImage(){
    console.log("generate flipped image");
    var originalImg = document.getElementById('originalImg');
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = originalImg.width;
    canvas.height = originalImg.height;

    ctx.drawImage(originalImg, 0, 0, originalImg.width, originalImg.height);
    ctx.scale(-1, 1);
    ctx.drawImage(canvas, -originalImg.width, 0, originalImg.width, originalImg.height);

    var flippedImg = new Image();
    flippedImg.setAttribute("id", "flippedImg");
    flippedImg.src = canvas.toDataURL();
    newImageContainer.appendChild(flippedImg);

}

function createAnimation(){
    console.log("create animation");

    //load images
    var animation = document.getElementById("animation");
    animation.width = animationWidth;
    animation.height = animationWidth;
    var baseImg = document.getElementById("originalImg");
    var baseRImg = document.getElementById("flippedImg");
    var ctx = animation.getContext("2d", { willReadFrequently: true }); //added willReadFrequently
    var pat = ctx.createPattern(baseImg, "repeat");
    var patR = ctx.createPattern(baseRImg, "repeat");
        
    //height of triangle side given side length of 150 is:
    var height =  SqrtOf3_4 * patDim;
    var offset = 0;
    ctx.translate(-0.5*patDim, 0);
    
    var fn = function(alternateMode){

        //offset = (offset - 1) % 1024
        offset = Math.sin(counter/animationLength)*animationLength; //makes animation go forward then backwards
        counter++;
        var i = 0;

        //draw kaleidoscope first row.
        ctx.save();
        ctx.fillStyle=pat;
        ctx.translate(0, offset);
        while(i <= 3){
            ctx.beginPath();
            ctx.moveTo(0,-offset);
            ctx.lineTo(patDim, -offset);
            ctx.lineTo(0.5*patDim, height-offset);
            ctx.closePath();
            ctx.stroke();	//stroke included here helps with illustrating the draw
            ctx.fill();
            if(i%3==0){
                ctx.translate(patDim,-offset);
                ctx.rotate(-120*Math.PI/180);
                ctx.translate(-patDim,offset);
            }
            else if(i%3==1){
                if(alternateMode){
                ctx.rotate(120*Math.PI/180);
                ctx.translate(-3*patDim, 0);
                ctx.rotate(-120*Math.PI/180);
                }
                ctx.translate(0.5*patDim, height-offset);
                ctx.rotate(-120*Math.PI/180);
                ctx.translate(-0.5*patDim, -height+offset);
            }
            else if(i%3==2){
                ctx.translate(0,-offset);
                ctx.rotate(-120*Math.PI/180);
                ctx.translate(0,offset);
            }
            i++;
        }
        
        ctx.restore();
        ctx.save();
        ctx.scale(-1,-1);
        ctx.fillStyle=patR;
        ctx.translate((-i+(i%3==0?0.5:i%3==1?1.5:-0.5))*patDim, -height+offset);
        ctx.translate(0, -offset);
        ctx.rotate(120*Math.PI/180);
        ctx.translate(0, offset);
        
        var j=0;
        while(j < i+1){
            ctx.beginPath();
            if(j>0||!alternateMode){
                ctx.moveTo(0,-offset);
                ctx.lineTo(patDim, -offset);
                ctx.lineTo(0.5*patDim, height-offset);
                ctx.closePath();
                ctx.fill();
            }
            if(j%3==1){
                ctx.translate(patDim,-offset);
                ctx.rotate(-120*Math.PI/180);
                ctx.translate(-patDim,offset);
            }
            else if(j%3==2){
                ctx.translate(0.5*patDim, height-offset);
                ctx.rotate(-120*Math.PI/180);
                ctx.translate(-0.5*patDim, -height+offset);
            }
            else if(j%3==0){
                ctx.translate(0,-offset);
                ctx.rotate(-120*Math.PI/180);
                ctx.translate(0,offset);
            }
            j++;
        }

        ctx.restore();
        
    };

    var patternHeight = Math.floor(SqrtOf3_4*patDim*2);

    //tile function makes the animation fill up the whole canvas width/height
    var tile = function(){
        var rowData = ctx.getImageData(0,0,patDim*3,patternHeight);
        for(var i=0; patternHeight*i<animationWidth+SqrtOf3_4*patDim; i++){
            for(var j = 0; j*patDim<animationWidth+patDim; j+=3){
            ctx.putImageData(rowData,j*patDim,i*patternHeight);
            }
        }
    }

    //this creates the animation by calling the functions again and again every x miliseconds
    window.setInterval(
        function(){
            fn(false);
            ctx.translate(animationStep*patDim, height);
            fn(true);
            ctx.translate(animationStep*-1*patDim, -height);
            tile();
        } , animationSpeed);

}