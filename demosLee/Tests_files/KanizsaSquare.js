/********************************************************************
 *
 *	Project Name: Kanizsa Square
 *	Version: 1.0 (7-August-2013)
 *	Author: Thomas Hendrickx
 *
 *	This software contains the neccesary functions to manage a canvas
 *	and run the KanizsaSquare test in it.
 *
 ********************************************************************/

/***********************
 *	CONSTANTS
 ***********************/
var KANIZSA_SQUARE_TEST_NAME = "Square";
var KANIZSA_SQUARE_MOTION_TIME = 2; //seconds
var KANIZSA_SQUARE_BACKGROUND_COLOR = "#000000";
var KANIZSA_SQUARE_CIRCLE_COLOR = "#FFFFFF";

// This is only in the beginning. After 30 samples of the screen refreshrate, the Kanizsa_Square_draw_interval will be set to the samen value as the refresh rate.
var KANIZSA_SQUARE_DRAW_INTERVAL = 100; //ms


var Kanizsa_Square_GC_KanizaScram = 0;
var Kanizsa_Square_BoxControl = 1;
var Kanizsa_Square_Global_Flex_BoxSize = 0;
var Kanizsa_Square_up_down = 0;



/***********************
 *	VARIABLES
 ***********************/
var Kanizsa_Square_canvas;
var Kanizsa_Square_ctx;
var Kanizsa_Square_G_Kan_i = 0;
var Kanizsa_Square_speed;
var Kanizsa_Square_background;
var Kanizsa_Square_draw_interval = KANIZSA_SQUARE_DRAW_INTERVAL;
var Kanizsa_Square_done = false;
var Kanizsa_Square_result;

//These variables are needed to make everything relative to the screen size.
var Kanizsa_Square_max_left;
var Kanizsa_Square_max_right;

var Kanizsa_Square_running = false;
var Kanizsa_Square_running_loop;

/***********************
 *	INIT FUNCTION
 ***********************/
function Kanizsa_Square_init() {
    Kanizsa_Square_setCanvasAndContext();

    //window.addEventListener("keydown",Kanizsa_Square_doKeyDown, false);
    //window.addEventListener("mousedown", Kanizsa_Square_doMouseMove, false);
    //window.addEventListener("mouseup", Kanizsa_Square_doMouseMove, false);
    //window.addEventListener("mousemove", Kanizsa_Square_doMouseMove, false);

    Kanizsa_Square_determineRelativeParameters(Kanizsa_Square_ctx.canvas.width, Kanizsa_Square_ctx.canvas.height);
   /* Kanizsa_Square_getFPSScreen();  */
    Kanizsa_Square_background = new ColouredRectangle(0, 0, Kanizsa_Square_ctx.canvas.width, Kanizsa_Square_ctx.canvas.height, KANIZSA_SQUARE_BACKGROUND_COLOR);
   /* Kanizsa_Square_calculateSpeed();  */

    Kanizsa_Square_running = true;
    Kanizsa_Square_running_loop = setInterval(Kanizsa_Square_draw, Kanizsa_Square_draw_interval);
}

function Kanizsa_Square_stop(){
    if(Kanizsa_Square_running){
        Kanizsa_Square_running = false;
        clearInterval(Kanizsa_Square_running_loop);
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
function Kanizsa_Square_drawCircle(c, color) {
    Kanizsa_Square_ctx.beginPath();
    Kanizsa_Square_ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
    Kanizsa_Square_ctx.fillStyle = color;
    Kanizsa_Square_ctx.fill();
}

function Kanizsa_Square_drawRectangle(r, color) {
    Kanizsa_Square_ctx.beginPath();
    Kanizsa_Square_ctx.rect(r.x, r.y, r.width, r.height);
    Kanizsa_Square_ctx.fillStyle = color;
    Kanizsa_Square_ctx.fill();
}

function Kanizsa_Square_draw() {
    Kanizsa_Square_ctx.clearRect(0, 0, Kanizsa_Square_canvas.width, Kanizsa_Square_canvas.height);

    Kanizsa_Square_drawRectangle(Kanizsa_Square_background.rect, Kanizsa_Square_background.colour);
    if(!Kanizsa_Square_done){
        Kanizsa_Square_drawKanizsa();
    }else{
        Kanizsa_Square_drawResult();
    }
    Kanizsa_Square_G_Kan_i++;
}

function Kanizsa_Square_drawResult(){
    Kanizsa_Square_ctx.fillStyle = 'black';
    Kanizsa_Square_ctx.font = 'italic 40pt Calibri';
    Kanizsa_Square_ctx.textAlign = 'center';
    Kanizsa_Square_ctx.fillText("Result",Kanizsa_Square_ctx.canvas.width/2,Kanizsa_Square_ctx.canvas.height/3);
    Kanizsa_Square_ctx.fillText(Kanizsa_Square_result,Kanizsa_Square_ctx.canvas.width/2,2*Kanizsa_Square_ctx.canvas.height/3);
}

/***********************
 *	INPUT FUNCTIONS
 ***********************/
function Kanizsa_Square_doMouseMove(e) {
   /* var val = $("#slider").slider("value");
    var r_a = ((100 - val) / 100);
    var backg = 221;
    var colour = Math.round(backg * (1 - r_a));
    var col = "rgb(" + colour + ", " + colour + ", " + colour + ")";
    screen1.colour = col;
    screen2.colour = col;
    screen3.colour = col;  */
}

function Kanizsa_Square_doKeyDown(e){
    if(e.keyCode == 49 || e.keyCode == 96){
        Kanizsa_Square_GC_KanizaScram = 0;
    }else if(e.keyCode == 50 || e.keyCode == 97){
        Kanizsa_Square_GC_KanizaScram = 1;
    }else if(e.keyCode == 51 || e.keyCode == 98){
        Kanizsa_Square_GC_KanizaScram = 2;
    }else if(e.keyCode == 38){
        Kanizsa_Square_up_down = 0;
    }else if(e.keyCode == 40){
        Kanizsa_Square_up_down = 1;
    }
    /*if(!Kanizsa_Square_done){
        var res = $("#slider").slider("value");
        console.log(res);
        sendData(user,res,KANIZSA_SQUARE_TEST_NAME);
        Kanizsa_Square_endTest(res);
    }    */
}

function Kanizsa_Square_doMouseUp(e){
}

function Kanizsa_Square_doMouseDown(e){
}

/***********************
 *	OTHER FUNCTIONS
 ***********************/
function Kanizsa_Square_determineRelativeParameters(width, height) {
    Kanizsa_Square_Global_Flex_BoxSize = width * 0.1;
}

function Kanizsa_Square_setCanvasAndContext() {
    Kanizsa_Square_canvas = document.getElementById("myCanvas");
    Kanizsa_Square_ctx = Kanizsa_Square_canvas.getContext("2d");
    Kanizsa_Square_ctx.canvas.height = window.innerHeight * 0.88;
    Kanizsa_Square_ctx.canvas.width = window.innerHeight * 0.88;

    var slider = $('#slider');
    slider.css('width', Kanizsa_Square_ctx.canvas.width);

    var menu_dv = document.getElementById("menu_div");
    var menW = menu_dv.style.width;
    var mnW = menW.substring(0,3);
    var offs = -1*(window.innerWidth - mnW - Kanizsa_Square_ctx.canvas.width)/2+12.13;

    var canvas_dv = $("#canvas_div");
    canvas_dv.css('left',offs);

    /*var menu = $('#menu_div');
     menu.css('width',Kanizsa_Square_ctx.canvas.width);
     menu.css('height',25);*/
}

function Kanizsa_Square_getFPSScreen() {
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
            Kanizsa_Square_calculateFPS(samples);
            return;
        } else if (nr_of_samples > 10) {
            samples.push(interval);
        }
        nr_of_samples++;
        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function Kanizsa_Square_calculateFPS(samples) {
    var average_interval = 0;
    for (var i = 0; i < samples.length; i++) {
        average_interval += samples[i];
    }
    average_interval = average_interval / samples.length;
    Kanizsa_Square_draw_interval = average_interval;
    Kanizsa_Square_calculateSpeed();
}

function Kanizsa_Square_calculateSpeed() {
    var motion = Kanizsa_Square_max_right - Kanizsa_Square_max_left;
    var screen_frequency = (1 / Kanizsa_Square_draw_interval) * 1000;
    Kanizsa_Square_speed = (motion / (screen_frequency * KANIZSA_SQUARE_MOTION_TIME));
}

function Kanizsa_Square_endTest(toShow){
    Kanizsa_Square_done = true;
    Kanizsa_Square_result = toShow;
}

function Kanizsa_Square_drawKanizsa(){

    var numsteps = 8;

    //The normal one -> white square moving down.
    if(Kanizsa_Square_GC_KanizaScram == 2){
        var XPac1,
            XPac2,
            YPac,
            PacSize,
            OccludSize;
        PacSize = (Kanizsa_Square_ctx.canvas.width / numsteps) * 2;
        YPac = (Kanizsa_Square_Global_Flex_BoxSize / 4 * (Kanizsa_Square_G_Kan_i%4));
        XPac1 = (Kanizsa_Square_ctx.canvas.width / 2) - PacSize / 2;

        if( /*G_TrialStructure[GlobalTrialOrderArray[G_RawTrialCount]].KanizaDirection*/Kanizsa_Square_up_down == 0){
            YPac = (Kanizsa_Square_ctx.canvas.width - (PacSize * (Kanizsa_Square_G_Kan_i % numsteps)));
        }
        if( /*G_TrialStructure[GlobalTrialOrderArray[G_RawTrialCount]].KanizaDirection*/Kanizsa_Square_up_down == 1){
            YPac = (PacSize * (Kanizsa_Square_G_Kan_i % numsteps)) - PacSize;
        }

        Kanizsa_Square_drawRectangle(new Rectangle(XPac1,YPac,PacSize,PacSize),KANIZSA_SQUARE_CIRCLE_COLOR);
    }

    //The other two
    if(Kanizsa_Square_GC_KanizaScram < 2){
        var XPac1,
            XPac2,
            YPac,
            PacSize,
            OccludSize;
        PacSize = Kanizsa_Square_ctx.canvas.width / 8; //square canvas so doesn't matter if we use height or width.
        var shiftmod,
            shiftDiv;
        OccludSize = PacSize / 2;
        for ( var iPac = 0 ; iPac < 4 ; iPac++ ) {
            XPac1 = (Kanizsa_Square_ctx.canvas.width/2 - (PacSize)); //In the C# code there was also '- PacSize/2'. This is not needed here as we draw cricles by center, and not by upper left corner.
            YPac = (PacSize*2)*iPac + PacSize;//The '+ PacSize' is needed because we work with the center of the circle.
            XPac2 = (Kanizsa_Square_ctx.canvas.width/2 + (PacSize)); //In the C# code there was also '- PacSize/2'. This is not needed here as we draw cricles by center, and not by upper left corner.

            //console.log(new Circle(XPac1,YPac,PacSize/2));
           // console.log(new Circle(XPac2,YPac,PacSize/2));
            Kanizsa_Square_drawCircle(new Circle(XPac1,YPac,PacSize/2),KANIZSA_SQUARE_CIRCLE_COLOR);
            Kanizsa_Square_drawCircle(new Circle(XPac2,YPac,PacSize/2),KANIZSA_SQUARE_CIRCLE_COLOR);
            var ri = 0;
            var localKan_i = 0;
            for( var iOcclude = 0 ; iOcclude < 4 ; iOcclude++ ) {
                if( iPac == iOcclude ) {
                    //shiftmod = (( iOcclude+1) /2)%2;
                    //shiftDiv = (iOcclude / 2) % 2;

                    //if( G_RawTrialCount % 2 == 0)
                    if( /*G_TrialStructure[GlobalTrialOrderArray[G_RawTrialCount].KanizaDirection*/Kanizsa_Square_up_down == 0 ){
                        localKan_i = ((Kanizsa_Square_G_Kan_i/2) % 4);

                        if( Kanizsa_Square_GC_KanizaScram == 1 && iOcclude % 2 == 0){
                            localKan_i = (localKan_i + 3) % 4;
                        }
                        //if( Kanizsa_Square_BoxControl == 2){
                        //    localKan_i = G_kan_i % 4;
                        //}
                    }
                    if( /*G_TrialStructure[GlobalTrialOrderArray[G_RawTrialCount].KanizaDirection*/Kanizsa_Square_up_down == 1 ){
                        localKan_i = 3-((Kanizsa_Square_G_Kan_i/2) % 4);

                        if( Kanizsa_Square_GC_KanizaScram == 1 && iOcclude % 2 == 0 ) {
                            localKan_i = (localKan_i+3)%4;
                        }
                        /*if(Kanizsa_Square_BoxControl == 2){
                            localKan_i = Kanizsa_Square_G_Kan_i % 4;
                        } */
                    }

                    if(Kanizsa_Square_BoxControl == 2 && iPac == 1 || Kanizsa_Square_BoxControl == 2 && iPac == 3){
                        //localKan_i = something random...
                    }
                    if(Kanizsa_Square_BoxControl == 3 && iPac == 1){
                        //localKan_i = something random...
                    }
                    if(Kanizsa_Square_BoxControl == 3 && iPac == 2){
                        //localKan_i = something random...
                    }

                    shiftmod = Math.floor(((iOcclude + 3 + localKan_i) % 4) / 2);
                    shiftDiv = Math.floor(((iOcclude + localKan_i) % 4) / 2);

                    //console.log(localKan_i);

                    Kanizsa_Square_drawRectangle(new Rectangle(XPac1-PacSize/2 + shiftmod*OccludSize, YPac-PacSize/2 + shiftDiv * OccludSize, OccludSize,OccludSize),KANIZSA_SQUARE_BACKGROUND_COLOR);

                    shiftmod =  Math.floor(((iOcclude + 1 + localKan_i) / 2) % 2);
                    shiftDiv =  Math.floor(((iOcclude + localKan_i) / 2) % 2);

                    Kanizsa_Square_drawRectangle(new Rectangle(XPac2-PacSize/2 + shiftmod*OccludSize, YPac-PacSize/2 + shiftDiv * OccludSize, OccludSize,OccludSize),KANIZSA_SQUARE_BACKGROUND_COLOR);
                }
            }
        }
    }
}