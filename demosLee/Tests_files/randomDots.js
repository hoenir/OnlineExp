/********************************************************************
 *
 *	Project Name: Random Dots
 *	Version: 1.0 (30-July-2013)
 *	Author: Thomas Hendrickx
 *
 *	This software contains the necessary functions to manage a canvas
 *	and run the Random Dots test in it.
 *
 ********************************************************************/

/***********************
 *	CONSTANTS
 ***********************/
var RANDOMDOTS_TEST_NAME = "RandomDots"

var RANDOMDOTS_BACKGROUND_COLOR = "#FFFFFF";
var RANDOMDOTS_BACKGROUND_R = 221; //this is DD in decimal -> used for fading away of dots.
var RANDOMDOTS_DRAW_INTERVAL = 10;//ms
var RANDOMDOTS_DOT_COLOR = "#000000";
var RANDOMDOTS_NUMBER_OF_DOTS = 500;
var RANDOMDOTS_LIFE_TIME = 500;//ms
var RANDOMDOTS_DIRECTION = "DOWN";
var RANDOMDOTS_TRAVEL_TIME = 25; //s -> the number of seconds it would take to go from one side of the screen to the other.
var RANDOMDOTS_RELATIVE_SIZE_DOTS = 0.005;
var RANDOMDOTS_TIME_OUT = 300;
var RANDOMDOTS_MAX_ATTEMPTS = 50;
var RANDOMDOTS_RAND_DOTS_INCR_UNIT = 0.01;

var KEY_ARROW_UP = 38;
var KEY_ARROW_DOWN = 40;
var KEY_ARROW_LEFT = 37;
var KEY_ARROW_RIGHT = 39;

/***********************
 *	VARIABLES
 ***********************/
var randomDots_succesive_correct = 0;
var randomDots_succesive_incorrect = 0;
var randomDots_attempts = 0;
var randomDots_background;
var randomDots_draw_interval = RANDOMDOTS_DRAW_INTERVAL;
var randomDots_dots;
var randomDots_random_dots = 0;
var randomDots_direction = RANDOMDOTS_DIRECTION;
var randomDots_dr_dots = true;
var randomDots_time_out;
var randomDots_done = false;
var randomDots_result;

//relative value
var randomDots_dot_radius = 5;
var randomDots_speed;

var randomDots_running = false;
var randomDots_running_loop;

/***********************
 *	INIT FUNCTION
 ***********************/
function randomDots_init(){
    randomDots_setCanvasAndContext();

    /*window.addEventListener("keydown",randomDots_doKeyDown,false);
    window.addEventListener("mousedown", randomDots_doMouseMove, false);
    window.addEventListener("mouseup", randomDots_doMouseMove, false);
    window.addEventListener("mousemove", randomDots_doMouseMove, false);        */

    randomDots_getFPSScreen();
    randomDots_background = new ColouredRectangle(0, 0, ctx.canvas.width, ctx.canvas.height, RANDOMDOTS_BACKGROUND_COLOR);

    randomDots_determineRelatives();
    randomDots_createDots();

    randomDots_determineSpeed(randomDots_draw_interval);
    randomDots_running = true;
    randomDots_running_loop = setInterval(randomDots_draw, randomDots_draw_interval);
}

function randomDots_stop(){
    if(randomDots_running){
        randomDots_running = false;
        clearInterval(randomDots_running_loop);
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

function randomDot_Dot(circle, vector, life){
    this.circle = circle;
    this.life = life;
    this.vector = vector;
}

/***********************
 *	DRAW FUNCTIONS
 ***********************/
function randomDots_drawDot(d, colour){
    var col = Math.round((1-randomDots_triangleValue(d.life/RANDOMDOTS_LIFE_TIME))*RANDOMDOTS_BACKGROUND_R);
    var color = "rgb("+col+","+col+","+col+")";
    randomDots_drawCircle(d.circle,color);
}

function randomDots_triangleValue(val){
    if(val < 0.5){
        return val *2;
    }else{
        return (1-val)*2;
    }
}

function randomDots_drawCircle(c, colour) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
    ctx.fillStyle = colour;
    ctx.fill();
}

function randomDots_drawRectangle(r, colour) {
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.width, r.height);
    ctx.fillStyle = colour;
    ctx.fill();
}

function randomDots_drawDots(all_dots, colour){
    for( var i = 0 ; i < all_dots.length ; i++ ){
        randomDots_drawDot(all_dots[i],colour);
    }
}

function randomDots_draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    randomDots_drawRectangle(randomDots_background.rect, randomDots_background.colour);
    if(!randomDots_done){
        if(randomDots_dr_dots){
            randomDots_drawDots(randomDots_dots,RANDOMDOTS_DOT_COLOR);
        }else{
            if(randomDots_time_out < RANDOMDOTS_TIME_OUT){
                randomDots_time_out += randomDots_draw_interval;
            }else{
                randomDots_dr_dots = true;
            }
        }
    }else{
        randomDots_drawResult();
    }
    randomDots_checkDotsLife(randomDots_dots);
}

function randomDots_drawResult(){
    ctx.fillStyle = 'black';
    ctx.font = 'italic 40pt Calibri';
    ctx.textAlign = 'center';
    ctx.fillText("Result",ctx.canvas.width/2,ctx.canvas.height/3);
    ctx.fillText(randomDots_result,ctx.canvas.width/2,2*ctx.canvas.height/3);
}

/***********************
 *	INPUT FUNCTIONS
 ***********************/
function randomDots_doMouseDown(e) {
    if(!randomDots_done){
        //noinspection JSUnresolvedFunction
        var val = $("#slider").slider("value");
        randomDots_random_dots = val/100;
    }
}

function randomDots_doKeyDown(e){
    if(!randomDots_done){
        if(e.keyCode == KEY_ARROW_DOWN){
            randomDots_newInput("DOWN");
        }else if(e.keyCode == KEY_ARROW_LEFT){
            randomDots_newInput("LEFT");
        }else if(e.keyCode == KEY_ARROW_RIGHT){
            randomDots_newInput("RIGHT");
        }else if(e.keyCode == KEY_ARROW_UP){
            randomDots_newInput("UP");
        }
    }
}

function randomDots_doMouseUp(e){
    if(!randomDots_done){
        //noinspection JSUnresolvedFunction
        var val = $("#slider").slider("value");
        randomDots_random_dots = val/100;
    }
}

function randomDots_doMouseMove(e){
    if(!randomDots_done){
        //noinspection JSUnresolvedFunction
        var val = $("#slider").slider("value");
        randomDots_random_dots = val/100;
    }
}

/***********************
 *	OTHER FUNCTIONS
 ***********************/
function randomDots_setCanvasAndContext() {
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

    /*var menu = $('#menu_div');
     menu.css('width',ctx.canvas.width);
     menu.css('height',25);*/
}

function randomDots_getFPSScreen() {
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
            randomDots_calculateFPS(samples);
            return;
        } else if (nr_of_samples > 10) {
            samples.push(interval);
        }
        nr_of_samples++;
        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function randomDots_calculateFPS(samples) {
    var average_interval = 0;
    for (var i = 0; i < samples.length; i++) {
        average_interval += samples[i];
    }
    average_interval = average_interval / samples.length;
    randomDots_determineSpeed(average_interval);
    randomDots_draw_interval = average_interval;
}

function randomDots_determineSpeed(interval){
    var travel_distance = ctx.canvas.width;
    var hz = (1/interval)*1000;
    randomDots_speed = travel_distance/(RANDOMDOTS_TRAVEL_TIME*hz);
}

function randomDots_createDots(){
    randomDots_dots = [];
    for( var i = 0 ; i < RANDOMDOTS_NUMBER_OF_DOTS ; i++ ){
        var temp_location = randomDots_getRandomLocation();
        var temp_vector;
        if(i > RANDOMDOTS_NUMBER_OF_DOTS*randomDots_random_dots){
            temp_vector = randomDots_getVector();
        }else{
            temp_vector = randomDots_getRandomVector();
        }
        var temp_circle = new Circle(temp_location.x,temp_location.y,randomDots_dot_radius)     ;
        var temp_dot = new randomDot_Dot(temp_circle, temp_vector,Math.random()*RANDOMDOTS_LIFE_TIME);
        randomDots_dots.push(temp_dot);
    }
}

function randomDots_getRandomLocation(){
    var randomHeight = Math.random()*ctx.canvas.height;
    var randomWidth = Math.random()*ctx.canvas.width;
    return new Point(randomWidth, randomHeight);
}

function randomDots_getRandomVector(){
    var x = Math.random();
    var y = Math.random();
    var x_value = x/(x+y);
    var y_value = y/(x+y);
    if(Math.random() > 0.5){
        x_value *= -1;
    }
    if(Math.random() > 0.5){
        y_value *= -1;
    }
    return new Point(x_value,y_value);
}

function randomDots_getVector(){
    if (randomDots_direction == "UP") {
        return new Point(0, -1);
    } else if (randomDots_direction == "DOWN") {
        return new Point(0, 1);
    } else if (randomDots_direction == "RIGHT") {
        return new Point(1, 0);
    } else if (randomDots_direction == "LEFT") {
        return new Point(-1, 0);
    } else {
        return new Point(0, -1);
    }
}

function randomDots_checkDotsLife(ds){
    for( var i = 0 ; i < ds.length ; i++ ){
        if(ds[i].life > RANDOMDOTS_LIFE_TIME){
            ds[i] = randomDots_newDot();
        }else{
            ds[i].life += randomDots_draw_interval;
            ds[i].circle.x += ds[i].vector.x * randomDots_speed;
            if(ds[i].circle.x < 0) ds[i].circle.x = ctx.canvas.width;
            if(ds[i].circle.x > ctx.canvas.width) ds[i].circle.x = 0;
            ds[i].circle.y += ds[i].vector.y * randomDots_speed;  7
            if(ds[i].circle.y < 0) ds[i].circle.y = ctx.canvas.height;
            if(ds[i].circle.y > ctx.canvas.height) ds[i].circle.y = 0;
        }
    }
}

function randomDots_newDot(){
    if (Math.random() < randomDots_random_dots) {
        //noinspection JSDuplicatedDeclaration
        var temp_location = randomDots_getRandomLocation();
        //noinspection JSDuplicatedDeclaration
        var temp_vector = randomDots_getRandomVector();
        //noinspection JSDuplicatedDeclaration
        var temp_circle = new Circle(temp_location.x, temp_location.y, randomDots_dot_radius);
        return new randomDot_Dot(temp_circle, temp_vector,0);
    } else {
        //noinspection JSDuplicatedDeclaration
        var temp_location = randomDots_getRandomLocation();
        //noinspection JSDuplicatedDeclaration
        var temp_vector = randomDots_getVector();
        //noinspection JSDuplicatedDeclaration
        var temp_circle = new Circle(temp_location.x, temp_location.y, randomDots_dot_radius);
        return new randomDot_Dot(temp_circle, temp_vector,0);
    }
}

function randomDots_determineRelatives(){
    randomDots_dot_radius = ctx.canvas.height*RANDOMDOTS_RELATIVE_SIZE_DOTS;
}

function randomDots_setRandomDots(value){
    if( value >= 0 || value <= 1){
        console.log("value = "+value);
        randomDots_random_dots = value;
        $(function() {
            $( "#slider" ).slider({
                value: (randomDots_random_dots*100)
            });
        });
    }
}

function randomDots_changeDirection(dir){
    randomDots_direction = dir;
    randomDots_dr_dots = false;
    randomDots_time_out = 0;
}

function randomDots_newInput(dir){
    if(dir === randomDots_direction){
        randomDots_succesive_correct++;
        randomDots_succesive_incorrect = 0;
        sendData(user,""+randomDots_attempts+"\tcorrect\t"+randomDots_random_dots,RANDOMDOTS_TEST_NAME);
        randomDots_setRandomDots(randomDots_random_dots+randomDots_getIncrement());
    }else{
        randomDots_succesive_incorrect++;
        randomDots_succesive_correct = 0;
        sendData(user,"incorrect",RANDOMDOTS_TEST_NAME);
        randomDots_setRandomDots(randomDots_random_dots-randomDots_getIncrement());
    }
    if(++randomDots_attempts >= RANDOMDOTS_MAX_ATTEMPTS){
        var res = (Math.round(randomDots_random_dots*100))/100; //This is randomDots_done to be sure that we get rid of number that are lower as 0.01. These are glitches of software/memory.
        randomDots_endTest(res);
        console.log(res);
    }
    randomDots_changeDirection(randomDots_getRandomDirection());
}

function randomDots_getRandomDirection(){
    var rnd = Math.random();
    if(rnd < 0.25) return "UP";
    if(rnd < 0.5) return "DOWN";
    if(rnd < 0.75) return "LEFT";
    return "RIGHT";
}

function randomDots_endTest(toShow){
    randomDots_done = true;
    randomDots_result = toShow;
}

function randomDots_getIncrement(){
    var return_val = RANDOMDOTS_RAND_DOTS_INCR_UNIT * Math.max(randomDots_succesive_correct,randomDots_succesive_incorrect);
    console.log(return_val);
    return return_val;
}