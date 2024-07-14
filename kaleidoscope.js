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
var maxImageWidth = 1000;
var maxImageHeight = 1000;
var SqrtOf3_4 = Math.sqrt(3)/2;

var animationWidth = 2000;

//create animation button
const goButton = document.getElementById('createAnimationButton');
goButton.addEventListener('click', createAnimation);

//animation variables
var animationSpeed = 1000 / 20; //larger values give slower animation
var patDim = animationWidth * 0.7; //pattern is 150x150 square.
var animationLength = 4096; //larger value give longer animation before restarting loop
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
            
            //adjust for max width
            if(actualWidth >= maxImageWidth){
                scaledWidth = maxImageWidth;
            } else{
                scaledWidth = Math.min(maxImageWidth,actualWidth*2);
            }
    
            widthScalingRatio = scaledWidth / actualWidth;
            scaledHeight = actualHeight * widthScalingRatio;
    
            //adjust for max height
            if(scaledHeight > maxImageHeight){
                scaledWidth = (maxImageHeight / scaledHeight) * scaledWidth;
                widthScalingRatio = scaledWidth / actualWidth;
                scaledHeight = actualHeight * widthScalingRatio;
            }
    
            var originalImg = document.createElement('img');
            originalImg.setAttribute("id", "originalImg");
            originalImg.src = imageData;
            originalImg.width = actualWidth;
            originalImg.height = actualHeight;
            imageContainer.appendChild(originalImg);

            generateFlippedImage();
    
        };
    };
      
    reader.readAsDataURL(file);
    
    isImageLoaded = true;
    
}

function generateFlippedImage(){
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
        offset = (offset - 1) % animationLength;
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

    var tile = function(){
        var rowData = ctx.getImageData(0,0,patDim*3,patternHeight);
        for(var i=0; patternHeight*i<animation.height+SqrtOf3_4*patDim; i++){
            for(var j = 0; j*patDim<animation.width+patDim; j+=3){
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

/*
ORIGINAL CODE
window.addEventListener("load", function(){
    //load images
    var c = document.getElementById("c");
    var baseImg = document.getElementById("base");
    var baseRImg = document.getElementById("baseR");
    var ctx = c.getContext("2d", { willReadFrequently: true }); //added willReadFrequently
    var pat = ctx.createPattern(baseImg, "repeat");
    var patR = ctx.createPattern(baseRImg, "repeat");
    
    var SqrtOf3_4 = Math.sqrt(3)/2;
    
    //height of triangle side given side length of 150 is:
    var height =  SqrtOf3_4 * patDim;
    var offset = 0;
    ctx.translate(-0.5*patDim, 0);
    
    var fn = function(alternateMode){
        offset = (offset - 1) % animationLength;
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

    var tile = function(){
        var rowData = ctx.getImageData(0,0,patDim*3,patternHeight);
        for(var i=0; patternHeight*i<c.height+SqrtOf3_4*patDim; i++){
            for(var j = 0; j*patDim<c.width+patDim; j+=3){
            ctx.putImageData(rowData,j*patDim,i*patternHeight);
            }
        }
    }

    //var tilingPatternData;
    //var target = document.getElementById("target");

    //this creates the animation by calling the functions again and again every x miliseconds
    
    window.setInterval(
        function(){
            fn(false);
            ctx.translate(animationStep*patDim, height);
            fn(true);
            ctx.translate(animationStep*-1*patDim, -height);
            tile();
        } , animationSpeed);
    
});
*/