/********************************************************************
 *
 *	Project Name: Causality
 *	Version: 1.0 (1-August-2013)
 *	Author: Thomas Hendrickx
 *
 *	This software contains the necessary functions to manage a canvas
 *	and run the Causality test in it.
 *
 ********************************************************************/

/***********************
 *	CONSTANTS
 ***********************/
var CAUSALITY_TEST_NAME = "Causality";

var CAUSALITY_BACKGROUND_COLOR = "#DDDDDD";
var CAUSALITY_DRAW_INTERVAL = 16;//ms
var CAUSALITY_CIRCLE_R_COLOR = 'black';
var CAUSALITY_CIRCLE_A_COLOR = 'blue';
var CAUSALITY_TRAVEL_TIME = 1.5;



/***********************
 *	VARIABLES
 ***********************/
var causality_background;
var causality_draw_interval = CAUSALITY_DRAW_INTERVAL;
var causality_done = false;
var causality_result;

var causality_circle_start_y;
var causality_circle_start_x;
var causality_circle_radius_a;
var causality_circle_radius_r

var causality_circle_action;
var causality_circle_reaction;

//relative value
var causality_speed = 1;


var causality_running = false;
var causality_running_loop;

/***********************
 *	INIT FUNCTION
 ***********************/
function causality_init(){
    causality_setCanvasAndContext();

    /*window.addEventListener("keydown",causality_doKeyDown,false);
    window.addEventListener("mousedown", causality_doMouseMove, false);
    window.addEventListener("mouseup", causality_doMouseMove, false);
    window.addEventListener("mousemove", causality_doMouseMove, false);      */

    causality_getFPSScreen();
    causality_background = new ColouredRectangle(0, 0, ctx.canvas.width, ctx.canvas.height, CAUSALITY_BACKGROUND_COLOR);

    causality_determineRelatives();

    causality_constructCircles();

    causality_determineSpeed(causality_draw_interval);

    causality_running = true;
    causality_running_loop = setInterval(causality_draw, causality_draw_interval);
}

function causality_stop(){
    if(causality_running){
        causality_running = false;
        clearInterval(causality_running_loop);
    }
}

/***********************
 *	OBJECTS
 ***********************/
function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Circle(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
}

function causality_MovingCircle(x,y,r,vector){
    this.circle = new Circle(x,y,r);
    this.vector = vector;
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

function causality_drawCircle(c, colour) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
    ctx.fillStyle = colour;
    ctx.fill();
}

function causality_drawRectangle(r, colour) {
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.width, r.height);
    ctx.fillStyle = colour;
    ctx.fill();
}

function causality_draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    causality_drawRectangle(causality_background.rect, causality_background.colour);
    if(!causality_done){
        causality_drawCircle(causality_circle_action.circle, CAUSALITY_CIRCLE_A_COLOR);
        causality_drawCircle(causality_circle_reaction.circle, CAUSALITY_CIRCLE_R_COLOR);
        causality_doPhysics(); //Because functions should have awesome names!
    }else{
        causality_drawResult();
    }
}

function causality_drawResult(){
    ctx.fillStyle = 'black';
    ctx.font = 'italic 40pt Calibri';
    ctx.textAlign = 'center';
    ctx.fillText("Result",ctx.canvas.width/2,ctx.canvas.height/3);
    ctx.fillText(causality_result,ctx.canvas.width/2,2*ctx.canvas.height/3);
}

/***********************
 *	INPUT FUNCTIONS
 ***********************/
function causality_doMouseMove(e) {
    if(!causality_done){
    }
}
function causality_doMouseDown(e) {
    if(!causality_done){
    }
}
function causality_doMouseUp(e) {
    if(!causality_done){
    }
}

function causality_doKeyDown(e){
    if(!causality_done){
        if(e.keyCode == KEY_ARROW_DOWN){
            newInput("DOWN");
        }else if(e.keyCode == KEY_ARROW_LEFT){
            newInput("LEFT");
        }else if(e.keyCode == KEY_ARROW_RIGHT){
            newInput("RIGHT");
        }else if(e.keyCode == KEY_ARROW_UP){
            newInput("UP");
        }
    }
}

/***********************
 *  PHYSICS FUNCTIONS
 **********************/
function causality_detectCollision(movingCircle1, movingCircle2){
    var distance = Math.sqrt(Math.pow(Math.abs(movingCircle1.circle.x - movingCircle2.circle.x),2) + Math.pow(Math.abs(movingCircle1.circle.y - movingCircle2.circle.y),2));
    var minimum_distance = (movingCircle1.circle.r + movingCircle2.circle.r)*0.95;
    if(distance >= minimum_distance) return false;
    else return true;
}

function causality_doPhysics(){
    causality_moveMovingCircle(causality_circle_action);
    causality_moveMovingCircle(causality_circle_reaction);
    if(causality_detectCollision(causality_circle_action,causality_circle_reaction)){
        causality_transferEnergy(causality_circle_action,causality_circle_reaction);
    }
    if(!causality_inbounds(causality_circle_reaction.circle)){
        causality_bounceBack(causality_circle_reaction);
    }
    if(!causality_inbounds(causality_circle_action.circle)){
        causality_bounceBack(causality_circle_action);
    }
}

function causality_bounceBack(movingCircle){
    movingCircle.vector.x *= -1;
    movingCircle.vector.y *= -1;
}

function causality_inbounds(circle){
    if(circle.x + circle.r > ctx.canvas.width) return false;
    if(circle.x - circle.r < 0) return false;
    if(circle.y - circle.r < 0) return false;
    if(circle.y + circle.r > ctx.canvas.height) return false;
    return true;
}

function causality_moveMovingCircle(moving_circle){
    moving_circle.circle.x += moving_circle.vector.x;
    moving_circle.circle.y += moving_circle.vector.y;
}

function causality_transferEnergy(from,to){
    var vec = causality_circle_reaction.vector;
    causality_circle_reaction.vector = causality_circle_action.vector;
    causality_circle_action.vector = vec;
}

/***********************
 *	OTHER FUNCTIONS
 ***********************/
function causality_setCanvasAndContext() {
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

function causality_getFPSScreen() {
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
            causality_calculateFPS(samples);
            return;
        } else if (nr_of_samples > 10) {
            samples.push(interval);
        }
        nr_of_samples++;
        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function causality_calculateFPS(samples) {
    var average_interval = 0;
    for (var i = 0; i < samples.length; i++) {
        average_interval += samples[i];
    }
    average_interval = average_interval / samples.length;
    causality_determineSpeed(average_interval);
    causality_draw_interval = average_interval;
}

function causality_determineSpeed(interval){
    var distance = ctx.canvas.width;
    var distancePerSecond = distance/CAUSALITY_TRAVEL_TIME;
    causality_speed = distancePerSecond*(interval/1000);
    if(causality_speed > ctx.canvas.width*0.1) causality_speed = ctx.canvas.width*0.1;
    if(causality_circle_action.vector.x > 0) causality_circle_action.vector.x = causality_speed;
    if(causality_circle_action.vector.x < 0) causality_circle_action.vector.x = -1*causality_speed;
    if(causality_circle_reaction.vector.y > 0) causality_circle_reaction.vector.y = causality_speed;
    if(causality_circle_reaction.vector.y < 0) causality_circle_reaction.vector.y = -1*causality_speed;
}

function causality_constructCircles(){
    causality_circle_action = new causality_MovingCircle(causality_circle_start_x,causality_circle_start_y,causality_circle_radius_a,new Point(causality_speed,0));
    causality_circle_reaction = new causality_MovingCircle(ctx.canvas.width/2 + causality_circle_start_x,ctx.canvas.height - causality_circle_start_y,causality_circle_radius_r, new Point(0,0));
}

function causality_determineRelatives(){
    causality_circle_radius_a = ctx.canvas.height * 0.05;
    causality_circle_radius_r = causality_circle_radius_a;
    causality_circle_start_x = causality_circle_radius_a;
    causality_circle_start_y = ctx.canvas.height/2;
}
