/********************************************************************
 *
 *	Project Name: Stuart Anstis Balls
 *	Version: 1.0
 *	Author: Thomas Hendrickx
 *
 *	This software contains the neccesary functions to manage a canvas
 *	and run the Stuart Anstis Balls test in it.
 *
 ********************************************************************/
/***********************
 *	CONSTANTS
 ***********************/
var BALLS_TEST_NAME = "Balls"
var BALLS_FULL_CIRCLE = 2 * Math.PI;
var BALLS_DRAW_INTERVAL = 10; //ms
var BALLS_ANGULAR_VELOCITY = (BALLS_FULL_CIRCLE/2); //radians per s
var BALLS_MAX_NUMB_ELEMENTS = 30;
var BALLS_MIN_NUMB_ELEMENTS = 2;
var BALLS_START_NUMB_ELEMENTS = 10;
var BALLS_CIRCLE_COLOR = 'black';
var BALLS_BACKGROUND_COLOR = "#DDDDDD";

/***********************
 *	VARIABLES
 ***********************/
var balls_canvas;
var balls_ctx;
var balls_circle_radius;
var balls_circle_path_radius;
var balls_angle = 0;
var balls_big_circle;
var balls_number_of_elements = BALLS_START_NUMB_ELEMENTS;
var balls_positions;
var balls_elements;
var balls_background;
var balls_draw_interval = BALLS_DRAW_INTERVAL;
var balls_angular_velocity;
var balls_user = [];
var balls_done = false;

var balls_running = false;
var balls_running_loop;

/***********************
 *	INIT FUNCTION
 ***********************/

function balls_init() {
    balls_setCanvasAndContext();

    balls_determineRelativeValues();

    /*window.addEventListener('keydown',balls_doKeyDown, false);
    window.addEventListener("mousedown", balls_doMouseMove, false);
    window.addEventListener("mouseup", balls_doMouseMove, false);
    window.addEventListener("mousemove", balls_doMouseMove, false);       */
    balls_background = new colouredRectangle(0, 0, balls_ctx.canvas.width, balls_ctx.canvas.height, BALLS_BACKGROUND_COLOR);
    balls_determineBigCircle();
    balls_determineElements();
    balls_getFPSScreen();
    balls_calculateSpeed();
    balls_running = true;
    balls_running_loop = setInterval(balls_draw, balls_draw_interval);
}

function balls_stop(){
    if(balls_running){
        balls_running = false;
        clearInterval(balls_running_loop);
    }
}

/***********************
 *	OBJECTS
 ***********************/

function balls_Element(circ_path, circ) {
    this.circ_path = circ_path;
    this.circ = circ;
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}

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

function colouredRectangle(x, y, width, height, colour) {
    this.rect = new Rectangle(x, y, width, height);
    this.colour = colour;
}

/***********************
 *	DRAW FUNCTIONS
 ***********************/

function balls_drawElement(element, angle) {
    var x1 = element.circ_path.x + element.circ_path.r * Math.cos(
        angle);
    var x2 = element.circ_path.x - element.circ_path.r * Math.cos(
        angle);

    var y1 = element.circ_path.y + element.circ_path.r * Math.sin(
        angle);
    var y2 = element.circ_path.y - element.circ_path.r * Math.sin(
        angle);

    var circle1 = new Circle(x1, y1, element.circ.r);
    var circle2 = new Circle(x2, y2, element.circ.r);

    balls_drawCircle(circle1, BALLS_CIRCLE_COLOR);
    balls_drawCircle(circle2, BALLS_CIRCLE_COLOR);
}

function balls_drawCircle(c, color) {
    balls_ctx.beginPath();
    balls_ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
    balls_ctx.fillStyle = color;
    balls_ctx.fill();
}

function balls_drawRectangle(r, color) {
    balls_ctx.beginPath();
    balls_ctx.rect(r.x, r.y, r.width, r.height);
    balls_ctx.fillStyle = color;
    balls_ctx.fill();
}

function balls_draw() {
    balls_ctx.clearRect(0, 0, balls_canvas.width, balls_canvas.height);
	balls_drawRectangle(balls_background.rect, balls_background.colour);
    if(!balls_done){
        balls_angle += balls_angular_velocity;
        for (var i = 0; i < balls_elements.length; i++) {
            balls_drawElement(balls_elements[i], balls_angle);
        }
    }else{
        balls_drawResult();
    }
}

function balls_drawResult(){
    balls_ctx.fillStyle = 'black';
    balls_ctx.font = 'italic 40pt Calibri';
    balls_ctx.textAlign = 'center';
    balls_ctx.fillText("Result",balls_ctx.canvas.width/2,balls_ctx.canvas.height/3);
    balls_ctx.fillText(balls_number_of_elements,balls_ctx.canvas.width/2,2*balls_ctx.canvas.height/3);
}

/***********************
 *	INPUT FUNCTIONS
 ***********************/

function balls_doMouseMove(e) {
    if(!balls_done){
        var val = $("#slider")
            .slider("value");
        balls_number_of_elements = Math.round(((BALLS_MAX_NUMB_ELEMENTS -
            BALLS_MIN_NUMB_ELEMENTS) * val) / 100) + BALLS_MIN_NUMB_ELEMENTS;
        balls_determineElements();
    }
}

function balls_doMouseDown(e) {
    if(!balls_done){
        var val = $("#slider")
            .slider("value");
        balls_number_of_elements = Math.round(((BALLS_MAX_NUMB_ELEMENTS -
            BALLS_MIN_NUMB_ELEMENTS) * val) / 100) + BALLS_MIN_NUMB_ELEMENTS;
        balls_determineElements();
    }
}

function balls_doMouseUp(e) {
    if(!balls_done){
        var val = $("#slider")
            .slider("value");
        balls_number_of_elements = Math.round(((BALLS_MAX_NUMB_ELEMENTS -
            BALLS_MIN_NUMB_ELEMENTS) * val) / 100) + BALLS_MIN_NUMB_ELEMENTS;
        balls_determineElements();
    }
}

function balls_doKeyDown(e){
    if(!balls_done){
        sendData(balls_user,balls_number_of_elements,BALLS_TEST_NAME);
        balls_endTest(balls_number_of_elements);
    }
}

/***********************
 *	OTHER FUNCTIONS
 ***********************/

function balls_determineElements() {
    balls_positions = [];
    balls_positions = balls_determinePostions(balls_big_circle, balls_number_of_elements);
    balls_elements = [];
    for (var i = 0; i < balls_positions.length; i++) {
        var circ_p = new Circle(balls_positions[i].x, balls_positions[i].y,
            balls_circle_path_radius);
        var start_x1 = circ_p.x + circ_p.r;
        var circ = new Circle(start_x1, circ_p.y, balls_circle_radius);
        var el = new balls_Element(circ_p, circ);
        balls_elements.push(el);
    }
}

function balls_determinePostions(big_circle, numb_items) {
    var angle_diff = BALLS_FULL_CIRCLE / numb_items;
    var ang = 0;
    var pos = new Array();
    for (var i = 0; i < numb_items; i++) {
        var pos_x = big_circle.x + big_circle.r * Math.cos(ang);
        var pos_y = big_circle.y + big_circle.r * Math.sin(ang);
        ang += angle_diff;
        var poin = new Point(pos_x, pos_y);
        pos.push(poin);
    }
    return pos;
}

function balls_determineBigCircle() {
    var big_circle_x = balls_ctx.canvas.width / 2;
    var big_circle_y = balls_ctx.canvas.height / 2 - 50;
    var big_circle_r = Math.min(big_circle_x / 2, big_circle_y / 2);
    balls_big_circle = new Circle(big_circle_x, big_circle_y, big_circle_r);
}

function balls_determineRelativeValues() {
    balls_circle_radius = balls_ctx.canvas.height * 0.01;
    balls_circle_path_radius = balls_ctx.canvas.height * 0.05;
}

function balls_setCanvasAndContext() {
    balls_canvas = document.getElementById("myCanvas");
    balls_ctx = balls_canvas.getContext("2d");
    balls_ctx.canvas.height = window.innerHeight * 0.88;
    balls_ctx.canvas.width = window.innerHeight * 0.88;

    var slider = $('#slider');
    slider.css('width', balls_ctx.canvas.width);

    var menu_dv = document.getElementById("menu_div");
    var menW = menu_dv.style.width;
    var mnW = menW.substring(0,3);
    var offs = -1*(window.innerWidth - mnW - balls_ctx.canvas.width)/2+12.13;

    var canvas_dv = $("#canvas_div");
    canvas_dv.css('left',offs);
}

function balls_getFPSScreen() {
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
            balls_calculateFPS(samples);
            return;
        } else if (nr_of_samples > 10) {
            samples.push(interval);
        }
        nr_of_samples++;
        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function balls_calculateFPS(samples) {
    var average_interval = 0;
    for (var i = 0; i < samples.length; i++) {
        average_interval += samples[i];
    }
    average_interval = average_interval / samples.length;
    balls_calculateSpeed();
    balls_draw_interval = average_interval;
}

function balls_calculateSpeed(){
	var screen_frequency = (1 / balls_draw_interval) * 1000;
    balls_angular_velocity = BALLS_ANGULAR_VELOCITY/screen_frequency;
}

function balls_endTest(toShow){
    balls_done = true;
}