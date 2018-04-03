/********************************************************************
*	
*	Project Name: Moving Square
*	Version: 1.0 (30-July-2013)
*	Author: Thomas Hendrickx
*
*	This software contains the neccesary functions to manage a canvas
*	and run the Moving square test in it.
*	
********************************************************************/

/***********************
*	CONSTANTS
***********************/
var SQUARE_TEST_NAME = "Square";
var SQUARE_MOTION_TIME = 2; //seconds
var SQUARE_BACKGROUND_COLOR = "#DDDDDD";

// This is only in the beginning. After 30 samples of the screen refreshrate, the square_draw_interval will be set to the samen value as the refresh rate.
var SQUARE_DRAW_INTERVAL = 10; //ms

/***********************
*	VARIABLES
***********************/
var square_canvas;
var square_ctx;
var square_rectangle;
var square_screen1;
var square_screen2;
var square_screen3;
var square_speed;
var square_background;
var square_draw_interval = SQUARE_DRAW_INTERVAL;
var square_done = false;
var square_result;

//These variables are needed to make everything relative to the screen size.
var square_width_betw_slides;
var square_first_slide_x;
var square_slide_width;
var square_diamond_height;
var square_diamond_x;
var square_diamond_y;
var square_max_left;
var square_max_right;

var square_running = false;
var square_running_loop;

/***********************
*	INIT FUNCTION 
***********************/
function square_init() {
    square_setCanvasAndContext();

   /* window.addEventListener("keydown",square_doKeyDown, false);
    window.addEventListener("mousedown", square_doMouseMove, false);
    window.addEventListener("mouseup", square_doMouseMove, false);
    window.addEventListener("mousemove", square_doMouseMove, false); */

    square_determineRelativeParameters(square_ctx.canvas.width, square_ctx.canvas.height);
    square_getFPSScreen();
    square_background = new colouredRectangle(0, 0, square_ctx.canvas.width, square_ctx.canvas.height, SQUARE_BACKGROUND_COLOR);
    square_calculateSpeed();
    square_rectangle = new Rectangle(square_diamond_x, square_diamond_y, diamond_width, square_diamond_height);
    square_screen1 = new colouredRectangle(square_first_slide_x, 0, square_slide_width, square_ctx.canvas.height, 'black');
    square_screen2 = new colouredRectangle((square_first_slide_x + square_slide_width + square_width_betw_slides), 0, square_slide_width, square_ctx.canvas.height, 'black');
    square_screen3 = new colouredRectangle((square_first_slide_x + square_slide_width + square_width_betw_slides + square_slide_width + square_width_betw_slides), 0, square_slide_width, square_ctx.canvas.height, 'black');

    square_running = true;
    square_running_loop = setInterval(square_draw, square_draw_interval);
}

function square_stop(){
    if(square_running){
        square_running = false;
        clearInterval(square_running_loop);
    }
}

/***********************
*	OBJECTS
***********************/
function Rectangle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

function colouredRectangle(x, y, width, height, colour) {
    this.rect = new Rectangle(x, y, width, height);
    this.colour = colour;
}

/***********************
*	DRAW FUNCTIONS
***********************/

function drawRectangle(r, color) {
    square_ctx.beginPath();
    square_ctx.rect(r.x, r.y, r.width, r.height);
    square_ctx.fillStyle = color;
    square_ctx.fill();
}

function square_drawDiamond(r, color) {
    square_ctx.beginPath();
    square_ctx.lineWidth = 10;
    // Nothing
    square_ctx.moveTo(r.x + (r.width / 2), r.y);
    square_ctx.lineTo(r.x + r.width, r.y + (r.height / 2));
    square_ctx.stroke();
    //  	\
    //	
    square_ctx.moveTo(r.x + r.width, r.y + (r.height / 2));
    square_ctx.lineTo(r.x + (r.width / 2), r.y + r.height);
    square_ctx.stroke();
    //		\
    //		/
    square_ctx.moveTo(r.x + (r.width / 2), r.y + r.height);
    square_ctx.lineTo(r.x, r.y + (r.height / 2));
    square_ctx.stroke();
    //		\
    //	   \/
    square_ctx.moveTo(r.x, r.y + (r.height / 2));
    square_ctx.lineTo(r.x + (r.width / 2), r.y);
    square_ctx.stroke();
    //	   /\
    //	   \/
}

function square_draw() {
    square_ctx.clearRect(0, 0, square_canvas.width, square_canvas.height);

    drawRectangle(square_background.rect, square_background.colour);
    if(!square_done){
        square_drawDiamond(square_rectangle, 'black');
        if (square_speed > 0) {
            if (square_rectangle.x < square_max_right) {
                square_rectangle.x += square_speed;
            } else {
                square_speed *= -1;
            }
        } else if (square_speed < 0) {
            if (square_rectangle.x > square_max_left) {
                square_rectangle.x += square_speed;
            } else {
                square_speed *= -1;
            }
        }
        drawRectangle(square_screen1.rect, SQUARE_BACKGROUND_COLOR);
        drawRectangle(square_screen2.rect, SQUARE_BACKGROUND_COLOR);
        drawRectangle(square_screen3.rect, SQUARE_BACKGROUND_COLOR);

        drawRectangle(square_screen1.rect, square_screen1.colour);
        drawRectangle(square_screen2.rect, square_screen2.colour);
        drawRectangle(square_screen3.rect, square_screen3.colour);
    }else{
        square_drawResult();
    }
}

function square_drawResult(){
    square_ctx.fillStyle = 'black';
    square_ctx.font = 'italic 40pt Calibri';
    square_ctx.textAlign = 'center';
    square_ctx.fillText("Result",square_ctx.canvas.width/2,square_ctx.canvas.height/3);
    square_ctx.fillText(square_result,square_ctx.canvas.width/2,2*square_ctx.canvas.height/3);
}

/***********************
*	INPUT FUNCTIONS
***********************/
function square_doMouseMove(e) {
    var val = $("#slider").slider("value");
    var r_a = ((100 - val) / 100);
    var backg = 221;
    var colour = Math.round(backg * (1 - r_a));
    var col = "rgb(" + colour + ", " + colour + ", " + colour + ")";
    square_screen1.colour = col;
    square_screen2.colour = col;
    square_screen3.colour = col;
}

function square_doMouseDown(e) {
    var val = $("#slider").slider("value");
    var r_a = ((100 - val) / 100);
    var backg = 221;
    var colour = Math.round(backg * (1 - r_a));
    var col = "rgb(" + colour + ", " + colour + ", " + colour + ")";
    square_screen1.colour = col;
    square_screen2.colour = col;
    square_screen3.colour = col;
}

function square_doMouseUp(e) {
    var val = $("#slider").slider("value");
    var r_a = ((100 - val) / 100);
    var backg = 221;
    var colour = Math.round(backg * (1 - r_a));
    var col = "rgb(" + colour + ", " + colour + ", " + colour + ")";
    square_screen1.colour = col;
    square_screen2.colour = col;
    square_screen3.colour = col;
}

function square_doKeyDown(e){
    if(!square_done){
        var res = $("#slider").slider("value");
        console.log(res);
        sendData(user,res,SQUARE_TEST_NAME);
        square_endTest(res);
    }
}

/***********************
*	OTHER FUNCTIONS
***********************/
function square_determineRelativeParameters(width, height) {
    square_width_betw_slides = width * 0.15;
    square_first_slide_x = width * 0.05;
    square_slide_width = width * 0.2;

    diamond_width = width * 0.65;
    square_diamond_height = diamond_width;
    square_diamond_x = (width / 2) - (diamond_width / 2) - (width * 0.05);
    square_diamond_y = (height / 2) - (square_diamond_height / 2);

    square_max_left = square_diamond_x;
    square_max_right = width - square_max_left - diamond_width;
}

function square_setCanvasAndContext() {
    square_canvas = document.getElementById("myCanvas");
    square_ctx = square_canvas.getContext("2d");
    square_ctx.canvas.height = window.innerHeight * 0.88;
    square_ctx.canvas.width = window.innerHeight * 0.88;

    var slider = $('#slider');
    slider.css('width', square_ctx.canvas.width);

    var menu_dv = document.getElementById("menu_div");
    var menW = menu_dv.style.width;
    var mnW = menW.substring(0,3);
    var offs = -1*(window.innerWidth - mnW - square_ctx.canvas.width)/2+12.13;

    var canvas_dv = $("#canvas_div");
    canvas_dv.css('left',offs);
}

function square_getFPSScreen() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;

    var start = performance.now();
    var nr_of_samples = 0;
    var samples = new Array();

    function step(timestamp) {
        var interval = timestamp - start;
        start = timestamp;
        if (nr_of_samples > 30) {
            square_calculateFPS(samples);
            return;
        } else if (nr_of_samples > 10) {
            samples.push(interval);
        }
        nr_of_samples++;
        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function square_calculateFPS(samples) {
    var average_interval = 0;
    for (var i = 0; i < samples.length; i++) {
        average_interval += samples[i];
    }
    average_interval = average_interval / samples.length;
    square_draw_interval = average_interval;
    square_calculateSpeed();
}

function square_calculateSpeed() {
    var motion = square_max_right - square_max_left;
    var screen_frequency = (1 / square_draw_interval) * 1000;
    square_speed = (motion / (screen_frequency * SQUARE_MOTION_TIME));
}

function square_endTest(toShow){
    square_done = true;
    square_result = toShow;
}