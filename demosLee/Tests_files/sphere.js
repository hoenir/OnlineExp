/********************************************************************
 *
 *	Project Name: Sphere
 *	Version: 1.0(2-August-2013)
 *	Author: Thomas Hendrickx
 *
 *	This software contains the necessary functions to manage a canvas
 *	and run the Sphere test in it.
 *
 ********************************************************************/

/***********************
 *	CONSTANTS
 ***********************/
var SPHERE_TEST_NAME = "Sphere"

var SPHERE_BACKGROUND_COLOR = "#DDDDDD";
var BACKGROUND_R = 221; //this is DD in decimal -> used for fading away of dots.
var SPHERE_DRAW_INTERVAL = 10;//ms
var SPHERE_NUM_SPHEREDOTS = 1000;


/***********************
 *	VARIABLES
 ***********************/
var sphere_background;
var sphere_draw_interval = SPHERE_DRAW_INTERVAL;
var sphere_done = false;
var sphere_result;
var sphere_G_SphereRotationCounter = 0;
var sphere_G_SphereDotArray = new Array(3);
var sphere_input_ratio = 0.5;

var sphere_circle_start_y;
var sphere_circle_start_x;
var sphere_circle_radius_a;
var sphere_circle_action

var sphere_running = false;
var sphere_running_loop;

/***********************
 *	INIT FUNCTION
 ***********************/
function sphere_init(){
    sphere_setCanvasAndContext();

    /*window.addEventListener("keydown",sphere_doKeyDown,false);
    window.addEventListener("mousedown", sphere_doMouseMove, false);
    window.addEventListener("mouseup", sphere_doMouseMove, false);
    window.addEventListener("mousemove", sphere_doMouseMove, false); */

    sphere_getFPSScreen();
    sphere_background = new ColouredRectangle(0, 0, ctx.canvas.width, ctx.canvas.height, SPHERE_BACKGROUND_COLOR);

    sphere_determineRelatives();

    sphere_initialiseArray();
    sphere_running = true;
    sphere_running_loop = setInterval(sphere_draw, sphere_draw_interval);
}

function sphere_stop(){
    if(sphere_running){
        sphere_running = false;
        clearInterval(sphere_running_loop);
    }
}

/***********************
 *	OBJECTS
 ***********************/

function Circle(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
}

function Rectangle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

function ColouredRectangle(x, y, width, height, colour) {
    this.rect = new Rectangle(x, y, width, height);
    this.colour = colour;
}

/***********************
 *	DRAW FUNCTIONS
 ***********************/

function sphere_drawCircle(c, colour) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
    ctx.fillStyle = colour;
    ctx.fill();
}

function sphere_drawRectangle(r, colour) {
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.width, r.height);
    ctx.fillStyle = colour;
    ctx.fill();
}

function sphere_draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sphere_drawRectangle(sphere_background.rect, sphere_background.colour);
    if(!sphere_done){
        sphere_drawSphere(sphere_input_ratio);
    }else{
        sphere_drawResult();
    }
    sphere_G_SphereRotationCounter++
    if(sphere_G_SphereRotationCounter >= 360) sphere_G_SphereRotationCounter = 0;;
}

function sphere_drawResult(){
    ctx.fillStyle = 'black';
    ctx.font = 'italic 40pt Calibri';
    ctx.textAlign = 'center';
    ctx.fillText("Result",ctx.canvas.width/2,ctx.canvas.height/3);
    ctx.fillText(sphere_result,ctx.canvas.width/2,2*ctx.canvas.height/3);
}

//CopyPaste of the C# function made by Mr. Lee de-Wit
function sphere_drawSphere(RatioUsed){
    var AVG_BALL_SIZE = 3;
    var myLocalColor = 0;
    var CosChange;
    var InCosChange;

    for ( var iDot = 0 ; iDot < SPHERE_NUM_SPHEREDOTS ; iDot++ ) {
        CosChange = RatioUsed*(Math.cos((2 * Math.PI) / 360 * sphere_G_SphereDotArray[2][iDot][sphere_G_SphereRotationCounter]));
        InCosChange = (1-RatioUsed) * (Math.cos((2*Math.PI) / 360 * (sphere_G_SphereDotArray[2][iDot][sphere_G_SphereRotationCounter])));
        myLocalColor = Math.round(140 - (30*CosChange) + (30*InCosChange))

        var BallsSize = AVG_BALL_SIZE + (2*CosChange) - (2*InCosChange);

        sphere_drawCircle(new Circle(sphere_G_SphereDotArray[0][iDot][sphere_G_SphereRotationCounter],sphere_G_SphereDotArray[1][iDot][sphere_G_SphereRotationCounter],BallsSize),"rgb("+myLocalColor+","+myLocalColor+","+myLocalColor+")");
    }
}

/***********************
 *	INPUT FUNCTIONS
 ***********************/
function sphere_doMouseMove(e) {
    if(!sphere_done){
        //noinspection JSUnresolvedFunction
        var val = $("#slider").slider("value");
        sphere_input_ratio = val/100;
    }
}

function sphere_doMouseDown(e) {
    if(!sphere_done){
        //noinspection JSUnresolvedFunction
        var val = $("#slider").slider("value");
        sphere_input_ratio = val/100;
    }
}

function sphere_doMouseUp(e) {
    if(!sphere_done){
        //noinspection JSUnresolvedFunction
        var val = $("#slider").slider("value");
        sphere_input_ratio = val/100;
    }
}

function sphere_doKeyDown(e){
    if(!sphere_done){

    }
}

/***********************
 *  PHYSICS FUNCTIONS
 **********************/


/***********************
 *	OTHER FUNCTIONS
 ***********************/
function sphere_setCanvasAndContext() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    ctx.canvas.height = window.innerHeight * 0.88;
    ctx.canvas.width = window.innerHeight * 0.88;

    var slider = $('#slider');
    slider.css('width', ctx.canvas.width);

    var menu_dv = document.getElementById("menu_div");
    var menW = menu_dv.style.width;
    var mnW = menW.substring(0,3);
    var offs = -1*(window.innerWidth - mnW - ctx.canvas.width)/2+12.13;

    var canvas_dv = $("#canvas_div");
    canvas_dv.css('left',offs);
}

function sphere_getFPSScreen() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;

    var start = performance.now();
    var nr_of_samples = 0;
    var samples = [];

    function step(timestamp) {
        var interval = timestamp - start;
        start = timestamp;
        if (nr_of_samples > 30) {
            sphere_calculateFPS(samples);
            return;
        } else if (nr_of_samples > 10) {
            samples.push(interval);
        }
        nr_of_samples++;
        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function sphere_calculateFPS(samples) {
    var average_interval = 0;
    for (var i = 0; i < samples.length; i++) {
        average_interval += samples[i];
    }
    average_interval = average_interval / samples.length;
    //determineSpeed(average_interval);
    sphere_draw_interval = average_interval;
}

function sphere_determineRelatives(){
    sphere_circle_radius_a = ctx.canvas.height * 0.05;
    sphere_circle_action = sphere_circle_radius_a;
    sphere_circle_start_x = sphere_circle_radius_a;
    sphere_circle_start_y = ctx.canvas.height/2;
}

function sphere_initialiseArray(){
    var mySW = ctx.canvas.width/2;
    var mySH = ctx.canvas.height/2;
    var Ylength;
    var Radius = mySW*.8;
    var RandDotPhase = new Array(SPHERE_NUM_SPHEREDOTS);

    for( var i = 0 ; i < sphere_G_SphereDotArray.length ; i++ ) {
        sphere_G_SphereDotArray[i] = new Array(SPHERE_NUM_SPHEREDOTS);
        for( var j = 0 ; j < sphere_G_SphereDotArray[i].length ; j++ ){
            sphere_G_SphereDotArray[i][j] = new Array(360);
        }
    }

    for( var i = 0 ; i  < SPHERE_NUM_SPHEREDOTS ; i++ ){
        RandDotPhase[i] = Math.random()*360;
    }

    for( var iDegree = 0 ; iDegree < 360 ; iDegree++ ) {
        for ( var iDot = 0 ; iDot < SPHERE_NUM_SPHEREDOTS ; iDot++ ) {
            Ylength = Math.cos((2*Math.PI)/360 * ((iDot/SPHERE_NUM_SPHEREDOTS)*360)) * Radius;
            sphere_G_SphereDotArray[0][iDot][iDegree] = Math.sin((2*Math.PI)/360 * ((iDegree + RandDotPhase[iDot]) % 360)) * (Math.sqrt((Radius * Radius) - (Ylength * Ylength))) + mySW;
            sphere_G_SphereDotArray[1][iDot][iDegree] = Ylength + mySH;
            sphere_G_SphereDotArray[2][iDot][iDegree] = (iDegree + RandDotPhase[iDot])%360;
        }
    }
}



