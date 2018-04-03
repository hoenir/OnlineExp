/********************************************************************
 *
 *	Project Name: MOT ellipses
 *	Version: 1.0 (8-August-2013)
 *	Author: Thomas Hendrickx
 *
 *	This software contains the necessary functions to manage a canvas
 *	and run the MOT ellipses test in it.
 *
 ********************************************************************/

/***********************
 *	CONSTANTS
 ***********************/
var MOT_ELLIPSES_BACKGROUND_COLOR = "#DDDDDD";
var MOT_ELLIPSES_DRAW_INTERVAL = 50;//ms
var MOT_ELLIPSES_DOT_COLOR = "#000000";
var MOT_ELLIPSES_NUMBER_OF_DOTS = 10;
var MOT_ELLIPSES_MAX_DEGREE = 2;
var MOT_ELLIPSES_IMPORTANT_FACTOR = 0.5;
var MOT_ELLIPSES_DOT_SIZE = 0.02;
var MOT_ELLIPSES_TEST_TIME = 10000; //ms
var MOT_ELLIPSES_DOT_VIEW_TIME = 3000; //ms
var MOT_ELLIPSES_ELLIPSE_WIDTH = 1;
var MOT_ELLIPSES_ELLIPSE_HEIGHT = 0.25;
var MOT_ELLIPSES_TARGET_RADIUS = 1;
var MOT_ELLIPSES_MOT_ELLIPSES_MIN_DIST_CENTER_PERC = 0.20;
var MOT_ELLIPSES_MIN_DIST_CENTER = 0;   //NOT a constant, but kept this way because I don't want to break it.
var MOT_ELLIPSES_MAX_SIZE = 1;
var MOT_ELLIPSES_MIN_SIZE = 0;
var MOT_ELLIPSES_NUMBER_OF_TRIALS = 60;
var MOT_ELLIPSES_SPAWN_IN_CENTER = 0.7;
var MOT_ELLIPSES_NUMBER_OF_TRIALS_VERTICAL = 0.5; //can vary from 0 (no vertical) to 1 (all vertical).
var MOT_ELLIPSES_DOT_SPEED = 8;
var MOT_ELLIPSES_SHOW_COLLISION = false;

/***********************
 *	VARIABLES
 ***********************/
var mot_ellipse_background;
var mot_ellipse_draw_interval = MOT_ELLIPSES_DRAW_INTERVAL;
var mot_ellipse_dots = [];
var mot_ellipse_done = false;
var mot_ellipse_result;
var mot_ellipse_canvas;
var mot_ellipse_ctx;
var mot_ellipse_time = 0;
var mot_ellipse_endView = false;
var mot_ellipse_endViewTime = 0;
var mot_ellipse_numImpDots = 0;
var mot_ellipse_trialNumber = 0;
var mot_ellipse_trials = [];
var mot_ellipse_trial_paths = [];
var mot_ellipse_test_paths = [];
var mot_ellipse_ellipse_width;
var mot_ellipse_ellipse_height;
var mot_ellipse_confirm_clicked = false;
var mot_ellipse_maximumDotsSelected = false;

//relative value
var mot_ellipse_circle_radius = 5;
var mot_ellipse_middleP;
var mot_ellipse_max_radius;

var mot_ellipse_running = false;
var mot_ellipse_running_loop;

/***********************
 *	INIT FUNCTION
 ***********************/
/**
 * This function is called when the user has given his data. First function that is called!
 */
function mot_ellipse_init(){
    if(mot_ellipse_running){
        console.log("mot_ellipse was running");
    }
    mot_ellipse_setCanvasAndContext();
    window.addEventListener("keydown",mot_ellipse_doKeyDown,false);
    window.addEventListener("mousedown", mot_ellipse_doMouseMove, false);
    //window.addEventListener("mouseup", mot_ellipse_doMouseMove, false);
    //window.addEventListener("mousemove", mot_ellipse_doMouseMove, false);

    mot_ellipse_getFPSScreen();
    mot_ellipse_background = new ColouredRectangle(0, 0, mot_ellipse_ctx.canvas.width, mot_ellipse_ctx.canvas.height, MOT_ELLIPSES_BACKGROUND_COLOR);

    mot_ellipse_createTrials();
    mot_ellipse_setupTrial();

    mot_ellipse_determineSpeed(mot_ellipse_draw_interval);

    mot_ellipse_ctx.clearRect(0, 0, mot_ellipse_canvas.width, mot_ellipse_canvas.height);
    mot_ellipse_drawRectangle(mot_ellipse_background.rect, mot_ellipse_background.colour);

    mot_ellipse_drawText("Calibrating...",mot_ellipse_ctx.canvas.width/2,mot_ellipse_ctx.canvas.height/2,'center',40,'black','black');
}

function mot_ellipse_stop(){
    if(mot_ellipse_running){
        var returnValue = clearInterval(mot_ellipse_running_loop);

        //Reset all values;
        mot_ellipse_background = null;
        mot_ellipse_draw_interval = MOT_ELLIPSES_DRAW_INTERVAL;
        mot_ellipse_dots = [];
        mot_ellipse_done = false;
        mot_ellipse_result = 0;;
        mot_ellipse_canvas;
        mot_ellipse_ctx;
        mot_ellipse_time = 0;
        mot_ellipse_endView = false;
        mot_ellipse_endViewTime = 0;
        mot_ellipse_numImpDots = 0;
        mot_ellipse_trialNumber = 0;
        mot_ellipse_trials = [];
        mot_ellipse_trial_paths = [];
        mot_ellipse_test_paths = [];
        mot_ellipse_ellipse_width = 0;
        mot_ellipse_ellipse_height = 0;
        mot_ellipse_confirm_clicked = false;
        mot_ellipse_maximumDotsSelected = false;
        mot_ellipse_circle_radius = 5;
        mot_ellipse_middleP = null;
        mot_ellipse_max_radius = 0;
        mot_ellipse_running = false;
        mot_ellipse_running_loop = 0;
    }
}

/***********************
 *	OBJECTS
 ***********************/
/**
 * A point on the canvas.
 * @param x The x coordinate of the point.
 * @param y The y coordinate of the point.
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

/**
 * A vector according the polar coordinates.
 * @param r Radius of the vector.
 * @param O Angle of the vector.
 */
function Vector_Polar(r,O){
    this.r = r;
    this.O = O;
}

/**
 * A Circle
 * @param x The x coordinate of the center of the circle.
 * @param y The y coordinate of the center of the circle.
 * @param r The radius of the circle.
 */
function Circle(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
}

/**
 * An Ellipse
 * @param x The x coordinate of the center of the ellipse.
 * @param y The y coordinate of the center of the ellise.
 * @param w The width of the ellipse.
 * @param h The height of the ellipse.
 * @param angle The angle of orientation of the ellipse.
 */
function mot_ellipse_Ellipse(x,y,w,h,angle){
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.w = Math.round(w);
    this.h = Math.round(h);
    this.angle = angle;
    this.turn = false;
    this.collided = false;

    /**
     * Draw the ellipse.
     * @param colour The colour that the ellipse should have.
     * @param mot_ellipse_ctx The context in which the ellipse should be drawn.
     */
    this.draw = function(colour, mot_ellipse_ctx) {
        var size_modifier = ((MOT_ELLIPSES_MAX_SIZE - MOT_ELLIPSES_MIN_SIZE)*(mot_ellipse_distanceBetweenPoints(mot_ellipse_middleP,new Point(this.x,this.y))/mot_ellipse_max_radius)+MOT_ELLIPSES_MIN_SIZE);
        this.h = mot_ellipse_ellipse_height*size_modifier;
        this.w = mot_ellipse_ellipse_width*size_modifier;
        var elgna = Math.atan((this.y - (mot_ellipse_ctx.canvas.height/2))/(this.x-(mot_ellipse_ctx.canvas.width/2)));
        var degrees = elgna*360 / (2*Math.PI);
        if(degrees < 0){
            if(this.x - (mot_ellipse_ctx.canvas.width/2) < 0){
                //180 verkeerd
                this.angle = degrees + 180;
            }else{
                this.angle = degrees + 360;
            }
        }else{
            if(this.x - (mot_ellipse_ctx.canvas.width/2) < 0){
                this.angle = degrees + 180;
            }else{
                this.angle = degrees;
            }
        }
        var cornerX = this.x;/* - this.w / 2.0  */
        var cornerY = this.y;/* - this.h / 2.0 */
        var r = Math.sqrt(Math.pow(cornerX,2)+Math.pow(cornerY,2));
        var phi = Math.asin(cornerY/r);
        var delta_angle = phi - elgna;
        var xCenter = r*Math.cos(delta_angle);
        var yCenter = r*Math.sin(delta_angle);
        var width = MOT_ELLIPSES_TARGET_RADIUS;
        var height = MOT_ELLIPSES_TARGET_RADIUS;
        if(this.turn){
            width = this.h;
            height = this.w;
        }
        drawEllipse(mot_ellipse_ctx, xCenter, yCenter, width, height, elgna,colour,true);
    };

    /**
     * Draw the outlining of the ellipse.
     * @param colour The colour of the ellipse.
     * @param mot_ellipse_ctx The context in which the ellipse should be drawn.
     */
    this.drawEmpty = function(colour,mot_ellipse_ctx) {
        var size_modifier = ((MOT_ELLIPSES_MAX_SIZE - MOT_ELLIPSES_MIN_SIZE)*(mot_ellipse_distanceBetweenPoints(mot_ellipse_middleP,new Point(this.x,this.y))/mot_ellipse_max_radius)+MOT_ELLIPSES_MIN_SIZE);
        this.h = mot_ellipse_ellipse_height*size_modifier*4;
        this.w = mot_ellipse_ellipse_width*size_modifier*4;
        this.angle = Math.atan((this.x - (mot_ellipse_ctx.canvas.width/2))/((mot_ellipse_ctx.canvas.height/2)-this.y));
        var cornerX = this.x;/* - this.w / 2.0  */
        var cornerY = this.y;/* - this.h / 2.0 */
        var r = Math.sqrt(Math.pow(cornerX,2)+Math.pow(cornerY,2));
        var phi = Math.asin(cornerY/r);
        var delta_angle = phi - this.angle;
        var xCenter = r*Math.cos(delta_angle);
        var yCenter = r*Math.sin(delta_angle);
        var width = this.w;
        var height = this.h;
        if(!this.turn){
            width = this.h;
            height = this.w;
        }
        drawEllipse(mot_ellipse_ctx, xCenter, yCenter, width, height, this.angle,colour,false);
    };

    /**
     * The raw drawing of the ellipse.
     * @param mot_ellipse_ctx The context in which the ellipse should be drawn.
     * @param x The x coordinate of the center of the ellipse.
     * @param y The y coordinate of the center of the ellipse.
     * @param w The width of the ellipse.
     * @param h The height of the ellipse.
     * @param angle The orientation angle of the ellipse.
     * @param colour The colour of the ellipse.
     * @param fill Boolean that the ellipse should be filled or not.
     */
    function drawEllipse(mot_ellipse_ctx, x, y, w, h,angle,colour,fill) {
        var kappa = .5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xb = x - w/ 2,
            yb = y - h/2,
            xe = x + w/2,           // x-end
            ye = y + h/2,           // y-end
            xm = x/* + w / 2*/,       // x-middle
            ym = y/* + h / 2*/;       // y-middle

        mot_ellipse_ctx.save();
        mot_ellipse_ctx.beginPath();
        mot_ellipse_ctx.rotate(angle);
        mot_ellipse_ctx.moveTo(xb, ym);
        mot_ellipse_ctx.bezierCurveTo(xb, ym - oy, xm - ox, yb, xm, yb);
        mot_ellipse_ctx.bezierCurveTo(xm + ox, yb, xe, ym - oy, xe, ym);
        mot_ellipse_ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        mot_ellipse_ctx.bezierCurveTo(xm - ox, ye, xb, ym + oy, xb, ym);
        mot_ellipse_ctx.fillStyle = colour;
        if(fill) mot_ellipse_ctx.fill();
        mot_ellipse_ctx.closePath();
        mot_ellipse_ctx.stroke();
        mot_ellipse_ctx.restore();
    }


}

/**
 * A rectangle
 * @param x The x coordinate of the upper left corner of the rectangle.
 * @param y The y coordinate of the upper left corner of the rectangle.
 * @param width The width of the rectangle.
 * @param height The height of the rectangle.
 */
function Rectangle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

/**
 * A Coloured rectangle.
 * @param x The x coordinate of the upper left corner of the rectangle.
 * @param y The y coordinate of the upper left corner of the rectangle.
 * @param width The width of the rectangle.
 * @param height The height of the rectangle.
 * @param colour The colour of the rectangle.
 */
function ColouredRectangle(x, y, width, height, colour) {
    this.rect = new Rectangle(x, y, width, height);
    this.colour = colour;
}

/**
 * A dot.
 * @param ellipse The ellipse shape of the dot.
 * @param vector The vector at which the ellipse moves (polar vector).
 * @param deviation The deviation that the dot has in it's movements (<0.5 dot will move more to the left, more negative is more to left. >0.5 more to the right and the higher, the more).
 * @param important The dot is an important one -> should be clicked at the end of the test.
 */
function mot_ellipse_Dot(ellipse, vector, deviation,important){
    this.ellipse = ellipse;
    this.vector = vector;
    this.deviation = deviation;
    this.oldLocations = new Array(10);
    this.important = important;
    this.clicked = false;
    this.deviationbuffer = 0;
    this.allowedToChangeAngle = true;
    this.draw = this.ellipse.draw;

    /**
     * Returns the object in string form. Usefull for when printing out the properties of the object.
     * @returns {string}
     */
    this.toString = function(){
        var vec = "vector{r:"+this.vector.r+" O:"+this.vector.O+"}";
        var ell = "ellipse{x:"+this.ellipse.x+" y:"+this.ellipse.y+" w:"+this.ellipse.w+" h:"+this.ellipse.h+"}";
        var all =   ell+"\r\n"+
            vec+"\r\n"+
            "div:"+this.deviation+"\r\n"+
            "oLo:"+this.oldLocations.length+"\r\n"+
            "imp:"+this.important+"\r\n";
        return all;
    }
}

function mot_ellipse_Trial(numDots,correctDots,orient,testTime){
    this.numDots = numDots;
    this.correctDots = correctDots;
    this.orient = orient;
    this.testTime = testTime;
}

/***********************
 *	DRAW FUNCTIONS
 ***********************/
/**
 * Draw the given point on the canvas. Because a point is impossible to draw, we need a radius for the point.
 * @param p The point to draw on the canvas.
 * @param colour The colour of the point.
 * @param radius The radius of the point on the canvas.
 */
function mot_ellipse_drawPoint(p,colour,radius){
    mot_ellipse_drawCircle(new Circle(p.x, p.y, radius),colour);
}

/**
 * Draw the given text on the screen at the given position with the wanted font size.
 * @param text The text string.
 * @param x The x position which will be left, middle or right of the text detpending on the alignment.
 * @param y The y position of the text which will be the bottom of the text.
 * @param align The alignment of the text relative to the given x,y position.
 * @param fontSize The size of the text font.
 * @param colour The colour of the text.
 */
function mot_ellipse_drawText(text,x,y,align,fontSize,colour,strokeColour){
    mot_ellipse_ctx.fillStyle = colour;
    mot_ellipse_ctx.strokeStyle = strokeColour
    mot_ellipse_ctx.font = 'italic '+fontSize+'pt Calibri';
    mot_ellipse_ctx.textAlign = align;
    mot_ellipse_ctx.fillText(text,x,y);
}

/**
 * Draw a line between points p and q.
 * @param p One of the points.
 * @param q The other point.
 */
function mot_ellipse_drawLineBetweenPoints(p,q){
    mot_ellipse_ctx.moveTo(p.x, p.y);
    mot_ellipse_ctx.lineTo(q.x, q.y);
    mot_ellipse_ctx.strokeStyle = 'green';
    mot_ellipse_ctx.stroke();
}

/**
 * Draw the given dot with the given colour.
 * @param d The dot.
 * @param colour The colour the dot should have.
 */
function mot_ellipse_drawDot(d, colour){
    d.ellipse.draw(colour,mot_ellipse_ctx);
    //drawPolarVector(d.vector, new Point(d.ellipse.x, d.ellipse.y), 90,'black');
    if(MOT_ELLIPSES_SHOW_COLLISION){
        var ell = new mot_ellipse_Ellipse(d.ellipse.x,d.ellipse.y,d.ellipse.w*4,d.ellipse.h*4, d.ellipse.angle);
        ell.drawEmpty(colour,mot_ellipse_ctx);
    }
}

/*The colour has to be in the format of #RRGGBBAA in hex*/
/**
 * The outlining of the dot will be drawn.
 * @param d The dot.
 * @param colour_out The colour of the ring of the dot. (format has to be "#RRGGBBAA")
 * @param colour_in  The colour of the inner part of the dot. (format has to be "#RRGGBBAA")
 */
function mot_ellipse_drawDotOutline(d,colour_out,colour_in){
    d.ellipse.draw(colour_out,mot_ellipse_ctx);
    var ell = new mot_ellipse_Ellipse(d.ellipse.x,d.ellipse.y,d.ellipse.w,d.ellipse.h, d.ellipse.angle);
    ell.draw(colour_in,mot_ellipse_ctx);
}

/**
 * Draw the given vector v from the point p and with a length of l. This is mot_ellipse_done in the given colour.
 * @param v The polar vector.
 * @param p The point at which the vector should start.
 * @param l The length of the vector.
 * @param colour The colour of the vector.
 */
function drawPolarVector(v,p,l,colour){
    mot_ellipse_ctx.moveTo(p.x, p.y);
    mot_ellipse_ctx.strokeStyle = colour;
    var oke = false;
    var x;
    var y;
    while(!oke){
        x = p.x + Math.cos(Math.PI*2*v.O/360)*l;
        y = p.y + Math.sin(Math.PI*2*v.O/360)*l;
        if(x >= 0 && x < mot_ellipse_ctx.canvas.width && y >= 0 && y < mot_ellipse_ctx.canvas.height){
            oke = true;
        }else{
            l--;
        }
    }
    mot_ellipse_ctx.lineTo(x,y);
    mot_ellipse_ctx.stroke();
}

/**
 * Draw the given circle in the given colour.
 * @param c The circle.
 * @param colour The colour.
 */
function mot_ellipse_drawCircle(c, colour) {
    mot_ellipse_ctx.beginPath();
    mot_ellipse_ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
    mot_ellipse_ctx.fillStyle = colour;
    mot_ellipse_ctx.fill();
}

/**
 * Draw the given rectangle in the given colour.
 * @param r The rectangle.
 * @param colour The colour.
 */
function mot_ellipse_drawRectangle(r, colour) {
    mot_ellipse_ctx.beginPath();
    mot_ellipse_ctx.rect(r.x, r.y, r.width, r.height);
    mot_ellipse_ctx.fillStyle = colour;
    mot_ellipse_ctx.fill();
}

/**
 * Draw the array of dots in the given colour.
 * @param all_dots The array of dots.
 * @param colour The colour.
 */
function mot_ellipse_drawDots(all_dots, colour){
    for( var i = 0 ; i < all_dots.length ; i++ ){
        var color = colour;
        if(mot_ellipse_time > MOT_ELLIPSES_TEST_TIME && all_dots[i].clicked){
            color = 'yellow';
        }
        mot_ellipse_drawDot(all_dots[i],color);
    }
}

/**
 * Draw the dots in there final form when the user has to see which dots he clicked where right and wrong.
 * @param all_dots The array of dots.
 * @param colour The standard colour for when they are not yet clicked.
 */
function mot_ellipse_drawResultDots(all_dots, colour){
    var color = colour;
    for( var i = 0 ; i < all_dots.length ; i++ ){
        colour = color;
        if(all_dots[i].clicked){
            if(all_dots[i].important){
                colour = '#C5B358';
                mot_ellipse_drawPositiveFeeback(all_dots[i].ellipse.x,all_dots[i].ellipse.y);
            }else{
                colour = 'red';
            }
            mot_ellipse_drawDotOutline(all_dots[i],color,colour)
        }else{
            mot_ellipse_drawDot(all_dots[i],color);
        }
    }
}

function mot_ellipse_drawPositiveFeeback(x,y){
    var relative_position = (mot_ellipse_endViewTime/1000)*mot_ellipse_ctx.canvas.width*0.05;
    if(mot_ellipse_endViewTime/1000 <= 1){
        mot_ellipse_drawText("10",x,y-relative_position,'center',20,'#C5B358','black');
    }
}

/**
 * Draw the whole canvas. This function is called in a loop. This is the main function of the whole javascript file and will contain everytbing needed.
 */  //TODO
function mot_ellipse_draw() {
    mot_ellipse_ctx.clearRect(0, 0, mot_ellipse_canvas.width, mot_ellipse_canvas.height);
    mot_ellipse_drawRectangle(mot_ellipse_background.rect, mot_ellipse_background.colour);
    if(!mot_ellipse_done){
        mot_ellipse_drawText("Trial "+mot_ellipse_trialNumber+"/"+MOT_ELLIPSES_NUMBER_OF_TRIALS,mot_ellipse_ctx.canvas.width,mot_ellipse_ctx.canvas.height,'end',15,'black','black');
        if(mot_ellipse_time > 3000 && mot_ellipse_time < (MOT_ELLIPSES_TEST_TIME+3000)){
            mot_ellipse_drawDots(mot_ellipse_dots,MOT_ELLIPSES_DOT_COLOR);
            mot_ellipse_doPhysics();
            mot_ellipse_storePaths();
            mot_ellipse_drawCenter();
        }else if( mot_ellipse_time < 3000){
            mot_ellipse_blinkIfNeeded();
            mot_ellipse_drawCenter();
        }else{
            if(mot_ellipse_endView){
                mot_ellipse_drawResultDots(mot_ellipse_dots,MOT_ELLIPSES_DOT_COLOR);
            }else{
                mot_ellipse_drawDots(mot_ellipse_dots,MOT_ELLIPSES_DOT_COLOR);
            }
            mot_ellipse_endOfTest();
        }
        mot_ellipse_time += mot_ellipse_draw_interval;
    }else{
        mot_ellipse_drawText("congratulations,",mot_ellipse_ctx.canvas.width/2,mot_ellipse_ctx.canvas.height/2-80,'center',40,'black','black');
        mot_ellipse_drawText("you have finished",mot_ellipse_ctx.canvas.width/2,mot_ellipse_ctx.canvas.height/2+0,'center',40,'black','black');
        mot_ellipse_drawText("the experiment!",mot_ellipse_ctx.canvas.width/2,mot_ellipse_ctx.canvas.height/2+80,'center',40,'black','black');
    }
}

/**
 * Draw a cross in the center of the screen.
 */
function mot_ellipse_drawCenter(){
    var width = 20;
    var height = 20;
    var horizontal = new Rectangle(mot_ellipse_ctx.canvas.width/2-width/2, mot_ellipse_ctx.canvas.height/2-1,width,2);
    var vertical = new Rectangle(mot_ellipse_ctx.canvas.width/2-1, mot_ellipse_ctx.canvas.height/2 - height/2, 2, height);

    mot_ellipse_drawRectangle(horizontal,'red');
    mot_ellipse_drawRectangle(vertical,'red');
}

/**
 * Draw the needed view at the end of the test.
 */
function mot_ellipse_endOfTest(){
    $('#myCanvas').css('cursor',"auto");
    var importantDots = 0;
    var clickedDots = 0;
    if(!mot_ellipse_endView){
        importantDots = 0;
        for ( var iDot = 0 ; iDot < mot_ellipse_dots.length ; iDot++ ) {
            if(mot_ellipse_dots[iDot].important){
                importantDots++;
            }
            if(mot_ellipse_dots[iDot].clicked){
                clickedDots++;
            }
        }
        if( clickedDots >= importantDots ){
            mot_ellipse_maximumDotsSelected = true;
        }else{
            mot_ellipse_maximumDotsSelected = false;
        }
        mot_ellipse_showNClicks(clickedDots);
    }
    if(clickedDots >= importantDots && mot_ellipse_confirm_clicked){
        document.getElementById('pop_up_info').innerHTML = "";
        $("#pop_up_info").css('font-size',mot_ellipse_ctx.canvas.height * 0.025);
        mot_ellipse_endView = true;
    }else if(clickedDots < importantDots && mot_ellipse_confirm_clicked){
        document.getElementById('pop_up_info').innerHTML = "Please select "+importantDots+" dots first";
        $("#pop_up_info").css('font-size',mot_ellipse_ctx.canvas.height * 0.025);
        mot_ellipse_confirm_clicked = false;
    }
    if(mot_ellipse_endView){
        mot_ellipse_endViewTime += mot_ellipse_draw_interval;
        var wrong = 0;
        for ( var idot = 0 ; idot < mot_ellipse_dots.length ; idot++ ) {
            if(!mot_ellipse_dots[idot].important && mot_ellipse_dots[idot].clicked) wrong++;
        }
        mot_ellipse_endTest(wrong);
        mot_ellipse_showResultAtInfo();
        if(mot_ellipse_endViewTime >= MOT_ELLIPSES_DOT_VIEW_TIME){
            mot_ellipse_startNextTrial();
        }
    }
}

function mot_ellipse_showNClicks(click){

    document.getElementById('n_cl').innerHTML = "Number of clicks:";
    $("#n_cl").css('font-size',mot_ellipse_ctx.canvas.height * 0.025);
    document.getElementById('n_click').innerHTML = click;
    $("#n_click").css('font-size',mot_ellipse_ctx.canvas.height * 0.025);
    document.getElementById('n_cl_info').innerHTML = "Press 'D' to see mot_ellipse_result";
    $("#n_cl_info").css('font-size',mot_ellipse_ctx.canvas.height * 0.025);

}

function mot_ellipse_resetRightSideInfo(){

    document.getElementById('n_cl').innerHTML = "";
    $("#n_cl").css('font-size',mot_ellipse_ctx.canvas.height * 0.025);
    document.getElementById('n_click').innerHTML = "";
    $("#n_click").css('font-size',mot_ellipse_ctx.canvas.height * 0.025);
    document.getElementById('n_cl_info').innerHTML = "";
    $("#n_cl_info").css('font-size',mot_ellipse_ctx.canvas.height * 0.025);

}

function mot_ellipse_showResultAtInfo(){

    document.getElementById('n_cl').innerHTML = "Result";
    $("#n_cl").css('font-size',mot_ellipse_ctx.canvas.height * 0.025);
    document.getElementById('n_click').innerHTML = mot_ellipse_result;
    $("#n_click").css('font-size',mot_ellipse_ctx.canvas.height * 0.025);
    document.getElementById('n_cl_info').innerHTML = "";
    $("#n_cl_info").css('font-size',mot_ellipse_ctx.canvas.height * 0.025);

}

/**
 * Let the important dots blink in the beginning. The other ones will not.
 */
function mot_ellipse_blinkIfNeeded(){
    var colour = "#000000";
    for( var i = 0 ; i < mot_ellipse_dots.length ; i++ ){
        if(!mot_ellipse_dots[i].important || (mot_ellipse_time%1000)<500){
            mot_ellipse_drawDot(mot_ellipse_dots[i],colour);
        }else{
            var color = 'red';
            mot_ellipse_drawDotOutline(mot_ellipse_dots[i],colour,color);
        }
    }
}

/***********************
 *	INPUT FUNCTIONS
 ***********************/
/**
 * Is called when the mouse was pressed down.
 * @param e The mouse event.
 */
function mot_ellipse_doMouseDown(e) {
    if(!mot_ellipse_done && mot_ellipse_time > MOT_ELLIPSES_TEST_TIME && !mot_ellipse_endView){
        var mouseX, mouseY;
        if(e.offsetX){
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        }else if(e.layerX){
            mouseX = e.layerX;
            mouseY = e.layerY;
        }
        var nearestDot;
        var smallesDist = mot_ellipse_ctx.canvas.width*2;
        var mouseP = new Point(mouseX,mouseY);
        for ( var iDot = 0 ; iDot < mot_ellipse_dots.length ; iDot++ ){
            var p = new Point(mot_ellipse_dots[iDot].ellipse.x,mot_ellipse_dots[iDot].ellipse.y);
            if(mot_ellipse_distanceBetweenPoints(p,mouseP) < smallesDist){
                smallesDist = mot_ellipse_distanceBetweenPoints(p,mouseP);
                nearestDot = mot_ellipse_dots[iDot];
            }
        }
        if( nearestDot.clicked ){
            nearestDot.clicked = !nearestDot.clicked;
        }else if( !nearestDot.clicked && !mot_ellipse_maximumDotsSelected){
            nearestDot.clicked = !nearestDot.clicked;
        }
    }
}

function mot_ellipse_doMouseUp(e) {
}

function mot_ellipse_doMouseMove(e) {
}

/**
 * Is called when a key is pressed down.
 * @param e The key event.
 */
function mot_ellipse_doKeyDown(e){
    if(!mot_ellipse_done){
        mot_ellipse_confirm_clicked = true;
        if( e.keyCode == 48 ){
            MOT_ELLIPSES_SHOW_COLLISION = !MOT_ELLIPSES_SHOW_COLLISION;
        }
    }
}

/***********************
 *  PHYSICS FUNCTIONS
 **********************/
/**
 * Detects if there is collision between the two given ellipses. If so it returns where ellipse 2 has hit ellipse 1 in string "up","left","down","right". If there was no collision "none" will be returned.
 * @param ellipse1 The 'not moving' ellipse.
 * @param ellipse2 The 'moved' ellipse.
 * @returns {string} "up","left","down","right" or "none".
 */
function mot_ellipse_detectCollision(ellipse1, ellipse2){
    if(ellipse1 === null || ellipse2 === null) return;
    var distance = mot_ellipse_distanceBetweenPoints(new Point(ellipse1.x,ellipse1.y),new Point(ellipse2.x,ellipse2.y));
    var minimum_distance = mot_ellipse_getMinDistTwoEll(ellipse1,ellipse2);
    if(distance < (minimum_distance*4)){
        var angle = Math.atan(Math.abs(ellipse2.y - ellipse1.y)/Math.abs(ellipse1.x - ellipse2.x));
        if(ellipse1.x - ellipse2.x < 0) angle *= -1;
        angle = radianToDegrees(angle);
        if(angle >= 45 && angle <= 135) return "up";
        if(angle >= 135 && angle <= 225) return "left";
        if(angle >= 225 && angle <= 315) return "down";
        if((angle >= 315 && angle <= 360) || (angle >= 0 && angle <= 45)) return "right";
    }
    else return "none";
}

function mot_ellipse_detectCollision_sides(ellipse1,ellipse2){

    var middle1 = new Point( ellipse1.x, ellipse1.y );
    var middle2 = new Point( ellipse2.x, ellipse2.y );

    var angle_ellipse1 = 360-mot_ellipse_determineAngleForEllipse(ellipse1);
    var point_ellipse1_a = new Point( ellipse1.x + 2*ellipse1.h*Math.sin( angle_ellipse1 * Math.PI * 2 / 360 ), ellipse1.y + 2*ellipse1.h*Math.cos( angle_ellipse1 * Math.PI * 2 / 360 ) );
    var point_ellipse1_b = new Point( ellipse1.x - 2*ellipse1.h*Math.sin( angle_ellipse1 * Math.PI * 2 / 360 ), ellipse1.y - 2*ellipse1.h*Math.cos( angle_ellipse1 * Math.PI * 2 / 360 ) );
    var point_ellipse1;
    if( mot_ellipse_distanceBetweenPoints(point_ellipse1_a,middle2) > mot_ellipse_distanceBetweenPoints(point_ellipse1_b,middle2)){
        point_ellipse1 = point_ellipse1_b
    }else point_ellipse1 = point_ellipse1_a;
    var point1_ellipse = mot_ellipse_pointToEllipse(point_ellipse1);

    var angle_ellipse2 = 360-mot_ellipse_determineAngleForEllipse(ellipse2);
    var point_ellipse2_a = new Point( ellipse2.x + 2*ellipse2.h*Math.sin( angle_ellipse2 * Math.PI * 2 / 360 ), ellipse2.y + 2*ellipse2.h*Math.cos( angle_ellipse2 * Math.PI * 2 / 360 ) );
    var point_ellipse2_b = new Point( ellipse2.x - 2*ellipse2.h*Math.sin( angle_ellipse2 * Math.PI * 2 / 360 ), ellipse2.y - 2*ellipse2.h*Math.cos( angle_ellipse2 * Math.PI * 2 / 360 ) );
    var point_ellipse2;
    if( mot_ellipse_distanceBetweenPoints(point_ellipse2_a,middle1) > mot_ellipse_distanceBetweenPoints(point_ellipse2_b,middle1)){
        point_ellipse2 = point_ellipse2_b
    }else point_ellipse2 = point_ellipse2_a;
    var point2_ellipse = mot_ellipse_pointToEllipse(point_ellipse2);

    var minimum_distance1 = 4*mot_ellipse_getMinDistTwoEll(ellipse1,point2_ellipse);
    var minimum_distance2 = 4*mot_ellipse_getMinDistTwoEll(ellipse2,point1_ellipse);

    if(mot_ellipse_distanceBetweenPoints(middle1,point_ellipse2) <= minimum_distance1){
        return true;
    }
    if(mot_ellipse_distanceBetweenPoints(middle2,point_ellipse1) <= minimum_distance2){
        return true;
    }
    return false;
}

function mot_ellipse_pointToEllipse(point){
    var ell = new mot_ellipse_Ellipse(point.x,point.y,1,1,0);
    var ellipse = new mot_ellipse_Ellipse(point.x,point.y,1,1,mot_ellipse_determineAngleForEllipse(ell));
    return ellipse;
}

function mot_ellipse_determineAngleForEllipse(ellipse){

    var size_modifier = ((MOT_ELLIPSES_MAX_SIZE - MOT_ELLIPSES_MIN_SIZE)*(mot_ellipse_distanceBetweenPoints(mot_ellipse_middleP,new Point(ellipse.x,ellipse.y))/mot_ellipse_max_radius)+MOT_ELLIPSES_MIN_SIZE);
    ellipse.h = mot_ellipse_ellipse_height*size_modifier;
    ellipse.w = mot_ellipse_ellipse_width*size_modifier;
    var elgna = Math.atan((ellipse.y - (mot_ellipse_ctx.canvas.height/2))/(ellipse.x-(mot_ellipse_ctx.canvas.width/2)));
    var degrees = elgna*360 / (2*Math.PI);
    if(degrees < 0){
        if(ellipse.x - (mot_ellipse_ctx.canvas.width/2) < 0){
            //180 verkeerd
            return degrees + 180;
        }else{
            return degrees + 360;
        }
    }else{
        if(ellipse.x - (mot_ellipse_ctx.canvas.width/2) < 0){
            return degrees + 180;
        }else{
            return degrees;
        }
    }
}


/**
 * Do all physics related stuff that is needed.
 */
function mot_ellipse_doPhysics(){
    for( var ii = 0 ; ii < mot_ellipse_dots.length ; ii++ ){
        mot_ellipse_dots[ii] = mot_ellipse_moveDot(mot_ellipse_dots[ii]);
        //Change the angle to make the path of the dot random
        if(mot_ellipse_dots[ii].allowedToChangeAngle){
            var delta_angle;
            if(Math.random() > mot_ellipse_dots[ii].deviation ){
                delta_angle = Math.random() * MOT_ELLIPSES_MAX_DEGREE;
            }else{
                delta_angle = (Math.random() * MOT_ELLIPSES_MAX_DEGREE)*-1;
            }
            mot_ellipse_dots[ii].vector.O = (mot_ellipse_dots[ii].vector.O + delta_angle)%360;
            if(mot_ellipse_dots[ii].vector.O < 0) mot_ellipse_dots[ii].vector.O = 360 + mot_ellipse_dots[ii].vector.O;
        }else{
            mot_ellipse_dots[ii].allowedToChangeAngle = true;
        }
        //Change the deviation of the dot.
        if((Math.round(mot_ellipse_time)%1000 < 10 || Math.round(mot_ellipse_time)%1000 > 990) && Math.random() < 0.3){
            mot_ellipse_dots[ii].deviation = (Math.random()/2)+0.25;
        }
    }
}

/**
 * Checks if the given ellipse is within the bounds of the canvas.
 * @param ellipse The ellipse.
 * @returns {string} "none" if withing "up","down","left","right" for where it collided.
 */
function mot_ellipse_inbounds(ellipse,vector){
    var angle = (ellipse.angle + 90)%360;
    var xModifier = MOT_ELLIPSES_TARGET_RADIUS;
    var yModifier = MOT_ELLIPSES_TARGET_RADIUS;
    if( mot_ellipse_movedAway(ellipse,vector) ){
        xModifier*=0.9;
        yModifier*=0.9;
    }
    if(ellipse.x + (xModifier) > mot_ellipse_ctx.canvas.width) return "right";
    if(ellipse.x - (xModifier) < 0) return "left";
    if(ellipse.y - (yModifier) < 0) return "up";
    if(ellipse.y + (yModifier) > mot_ellipse_ctx.canvas.height) return "down";
    return "none";
}

function mot_ellipse_movedAway(ellipse,vector){
    var angle = mot_ellipse_determineAngleForEllipse(ellipse);
    var vectorAngle = vector.O;
    if(angle >= 0 && angle <= 40){
        return vectorAngle >= 90 && vectorAngle <= 270;
    }
    else if(angle <= 50){
        return vectorAngle >= 135 && vectorAngle <= 315;
    }
    else if(angle <= 130){
        return vectorAngle >= 180 && vectorAngle <= 360;
    }
    else if(angle <= 140){
        return (vectorAngle >= 225 && vectorAngle <= 360)||(vectorAngle >= 0 && vectorAngle <= 45);
    }
    else if(angle <= 220){
        return (vectorAngle >= 270 /*&& vectorAngle <= 360*/)||(/*vectorAngle >= 0 && */vectorAngle <= 90);
    }
    else if(angle <= 230){
        return (vectorAngle >= 315 && vectorAngle <= 360)||(vectorAngle >= 0 && vectorAngle <= 135);
    }
    else if(angle <= 310){
        return (vectorAngle >= 0 && vectorAngle <= 180);
    }
    else if(angle <= 320){
        return (vectorAngle >= 45 && vectorAngle <= 225);
    }
    else if(angle <= 361){ //1 plus as margin
        return vectorAngle >= 90 && vectorAngle <= 270;
    }
    else{
        console.log("ERROR, Angle bigger as 360 or smaller as 0!");
        return false;
    }
}

/**
 * Get the radius of the given ellipse at the given internal angle.
 * @param angle_degrees The internal angle of the ellipse.
 * @param ellipse The ellipse.
 * @returns {number} radius in pixels.
 */
function mot_ellipse_getEllipseRadiusByAngle(angle_degrees,ellipse){
    var angle = angle_degrees * Math.PI * 2 / 360;
    var a = ellipse.w/2;
    var b = ellipse.h/2;
    var numerator = a*b;
    var denominator = Math.sqrt( Math.pow( b*Math.cos(angle) , 2 ) + Math.pow( a*Math.sin(angle), 2 ) );
    return numerator/denominator;
}

/**
 * Gives the distance between point p and q.
 * @param p
 * @param q
 * @returns {number} the distance in pixels.
 */
function mot_ellipse_distanceBetweenPoints(p,q){
    return Math.sqrt(Math.pow(p.x- q.x,2)+Math.pow(p.y- q.y,2));
}

/**
 * Move the given dot. All possible collision and move requirements will be checked here.
 * @param dot The dot to move.
 * @returns The moved dot.
 */
function mot_ellipse_moveDot(dot){
    var movedDot = new mot_ellipse_Dot(
        new mot_ellipse_Ellipse(
            dot.ellipse.x + dot.vector.r * Math.cos((dot.vector.O/360)*Math.PI*2),
            dot.ellipse.y + dot.vector.r * Math.sin((dot.vector.O/360)*Math.PI*2),
            dot.ellipse.w,
            dot.ellipse.h,
            dot.ellipse.angle
        ),
        dot.vector,
        dot.deviation,
        dot.important);
    var canMove = true;
    var direction;

    //DETECT IF INBOUNDS THIS HAS PRIORITY N°1!
    if((direction = mot_ellipse_inbounds(movedDot.ellipse,movedDot.vector)) != "none"){
        canMove = false;
        dot.vector.O = mot_ellipse_getBounceAngle(dot.vector.O,direction);
    } else
    //DETECT IF NOT IN THE MIDDLE CIRCLE. THIS HAS PRIORITY N°2!
    if(mot_ellipse_inMiddle(movedDot.ellipse)) {
        canMove = false;
        dot.vector.O += 180;
    }
    //DETECT COLLISION WITH NEAREST DOT. ONLY THE NEAREST TO KEEP THE DOT FROM FREAKING OUT. THIS HAS PRIORITY N°3!
    else {
        //First we need to find the nearest dot.
        var nearestDistance = 2*dot.ellipse.w * mot_ellipse_ctx.canvas.width*2; //We start with a number to make sure it has a value. This number because it is more than the maximum distance an other dot can ever be.
        var nearestDot = null;
        for( var iDot = 0 ; iDot < MOT_ELLIPSES_NUMBER_OF_DOTS ; iDot++ ) {
            //First we need to be sure that iDot is not the dot that we are determining the collision for.
            if( !mot_ellipse_checkEqualityDots(mot_ellipse_dots[iDot],dot) ){
                var relative_distance = mot_ellipse_getRelativeDistanceBetweenPoints(mot_ellipse_dots[iDot].ellipse,dot.ellipse,mot_ellipse_trials[mot_ellipse_trialNumber-1].orient);
               // if( relative_distance < 1 ) console.log(relative_distance);
                if(relative_distance < nearestDistance){
                    nearestDistance = relative_distance;
                    nearestDot = mot_ellipse_dots[iDot];
                }
            }
        }
        if(nearestDot == null && MOT_ELLIPSES_NUMBER_OF_DOTS > 1) {
            console.log("ERROR! There is an error in the code. The nearestDot variable should be defined, but is not");
        }else{
            //If the angle between the dots is more than 90° than they can never collide and we prevent the system for doing unneeded calculations.
            if(Math.abs(nearestDot.ellipse.angle - dot.ellipse.angle) < 90 || Math.abs(nearestDot.ellipse.angle - dot.ellipse.angle)>270 ){
                //Check for collision between the dot and the nearestDot.
                if( mot_ellipse_detectCollision( nearestDot.ellipse, movedDot.ellipse ) != "none" ) {
                    canMove = false;
                    dot.vector.O = ( dot.vector.O + 180 ) % 360;
                }
            }
        }
        if(canMove && mot_ellipse_trials[mot_ellipse_trialNumber-1].orient){
            if( mot_ellipse_detectCollision_sides(nearestDot.ellipse, movedDot.ellipse ) ) {
                canMove = false;
                dot.vector.O = ( dot.vector.O + 180 ) % 360;
            }
        }
    }
    if(canMove){
        return movedDot;
    }
    dot.collided = true;
    return dot;
}

/**
 * Get the relative distance between the given ellipses. This is because an ellipse has an unequality between radiuses at different internal angles. So to compare
 * distances between different ellipses a relative distance is used which gives a more accurate representation of the distance. The returned distance has no
 * real value. The number is only usefull in comparing relative distances.
 * @param ell1 ellispe 1.
 * @param ell2 ellipse 2.
 * @returns {number} The relative distance.
 */
function mot_ellipse_getRelativeDistanceBetweenPoints(ell1,ell2,orient){
    var dist_modifier = 4*mot_ellipse_getMinDistTwoEll(ell1,ell2);
    var distance = mot_ellipse_distanceBetweenPoints(new Point(ell1.x,ell1.y),new Point(ell2.x,ell2.y));
    if(orient){
        var exces_distance = distance - dist_modifier;

        var middle1 = new Point( ell1.x, ell1.y );
        var middle2 = new Point( ell2.x, ell2.y );

        var angle_ellipse1 = 360-mot_ellipse_determineAngleForEllipse(ell1);
        var point_ellipse1_a = new Point( ell1.x + 2*ell1.h*Math.sin( angle_ellipse1 * Math.PI * 2 / 360 ), ell1.y + 2*ell1.h*Math.cos( angle_ellipse1 * Math.PI * 2 / 360 ) );
        var point_ellipse1_b = new Point( ell1.x - 2*ell1.h*Math.sin( angle_ellipse1 * Math.PI * 2 / 360 ), ell1.y - 2*ell1.h*Math.cos( angle_ellipse1 * Math.PI * 2 / 360 ) );
        var point_ellipse1;
        if( mot_ellipse_distanceBetweenPoints(point_ellipse1_a,middle2) > mot_ellipse_distanceBetweenPoints(point_ellipse1_b,middle2)){
            point_ellipse1 = point_ellipse1_b
        }else point_ellipse1 = point_ellipse1_a;
        var point1_ellipse = mot_ellipse_pointToEllipse(point_ellipse1);

        var angle_ellipse2 = 360-mot_ellipse_determineAngleForEllipse(ell2);
        var point_ellipse2_a = new Point( ell2.x + 2*ell2.h*Math.sin( angle_ellipse2 * Math.PI * 2 / 360 ), ell2.y + 2*ell2.h*Math.cos( angle_ellipse2 * Math.PI * 2 / 360 ) );
        var point_ellipse2_b = new Point( ell2.x - 2*ell2.h*Math.sin( angle_ellipse2 * Math.PI * 2 / 360 ), ell2.y - 2*ell2.h*Math.cos( angle_ellipse2 * Math.PI * 2 / 360 ) );
        var point_ellipse2;
        if( mot_ellipse_distanceBetweenPoints(point_ellipse2_a,middle1) > mot_ellipse_distanceBetweenPoints(point_ellipse2_b,middle1)){
            point_ellipse2 = point_ellipse2_b
        }else point_ellipse2 = point_ellipse2_a;
        var point2_ellipse = mot_ellipse_pointToEllipse(point_ellipse2);

        var minimum_distance1 = 4*mot_ellipse_getMinDistTwoEll(ell1,point2_ellipse);
        var minimum_distance2 = 4*mot_ellipse_getMinDistTwoEll(ell2,point1_ellipse);

        var exces1 = mot_ellipse_distanceBetweenPoints(middle1,point_ellipse2) - minimum_distance1;
        var exces2 = mot_ellipse_distanceBetweenPoints(middle2,point_ellipse1) - minimum_distance2;
        return Math.min(exces_distance,exces1,exces2);
    }
    return distance*2/dist_modifier;
}

/**
 * Check if the two given dots are equal to eachother. This only checks if the coordinates are the same internaly.
 * @param dot1
 * @param dot2
 * @returns {boolean}
 */
function mot_ellipse_checkEqualityDots(dot1,dot2){
    if( dot1.ellipse.x != dot2.ellipse.x ) return false;
    if( dot1.ellipse.y != dot2.ellipse.y ) return false;
    return true;
}

/**
 * Checks to see if the ellipse is in the middle area of the canvas. This area is restricted due to technical difficulties for checking collision because of the turning
 * of the ellipses by there position on the screen. It was also restricted because the nature of the test did not allow dots to move through the visual fixation point.
 * @param ellipse
 * @returns {boolean}
 */
function mot_ellipse_inMiddle(ellipse){
    var delta_x = Math.abs( mot_ellipse_ctx.canvas.width /2 - ellipse.x );
    var delta_y = Math.abs( mot_ellipse_ctx.canvas.height/2 - ellipse.y );
    var distance_sq = delta_x*delta_x + delta_y*delta_y;
    return MOT_ELLIPSES_MIN_DIST_CENTER*MOT_ELLIPSES_MIN_DIST_CENTER >= distance_sq;
}

function LawOfCosines_getalpha(a,b,c){
    return LawOfCosines_getangle(b,c,a);
}

function LawOfCosines_getbeta(a,b,c){
    return LawOfCosines_getangle(c,a,b);
}

function LawOfCosines_getgamma(a,b,c){
    return LawOfCosines_getangle(a,b,c);
}

/**
 * Get angle gamma of the trangle ABC with sides abc. Gamma is the angle opposite of the side c.
 * @param a side a of the triangle.
 * @param b side b of the triangle.
 * @param c side c of the triangle.
 * @returns {number} angle gamma in DEGREES.
 */
function LawOfCosines_getangle(a,b,c){
    var ang_radian = Math.acos(    (  Math.pow(a,2)  +  Math.pow(b,2)  -  Math.pow(c,2)  )   /   (2*a*b)     ); //      acos( (a²+b²-c²)/(2ab) ) = gamma
    return ang_radian * 360 / ( 2 * Math.PI );    //From radians to degrees.
}

function mot_ellipse_getCollisionBounceAngle(circle_still, circle_moving){
    var angle = Math.atan(Math.abs(circle_moving.y - circle_still.y)/Math.abs(circle_still.x - circle_moving.x));
    if(circle_still.x - circle_moving.x < 0) angle *= -1;
    angle = radianToDegrees(angle);
    return (angle+180)%360;
}

function mot_ellipse_getBounceAngle(angle,direction){
    var bounceAngle = 180;
    if( direction === "up"){
        bounceAngle = 360 - angle;
    }else if( direction === "down"){
        bounceAngle = 360 - angle;
    }else if( direction === "left"){
        if( angle >= 0 && angle <= 180 ){
            bounceAngle = 180 - angle;
        }else{
            var Temp = angle - 180;
            var Temp2 = 180 - Temp;
            bounceAngle = 180 + Temp2;
        }
    }else if( direction === "right"){
        if( angle >= 0 && angle <= 180 ){
            bounceAngle = 180 - angle;
        }else{
            var temp = angle - 180;
            var temp2 = 180 - temp;
            bounceAngle = 180 + temp2;
        }
    }else{
        console.log("ERROR");
    }
    return bounceAngle%360;
}

function mot_ellipse_getMinDistTwoEll(ell1,ell2){
    var angles = mot_ellipse_getTwoAngles(ell1,ell2);
    var min_dist_ell_1 = mot_ellipse_getEllipseRadiusByAngle(angles.O1,ell1);
    var min_dist_ell_2 = mot_ellipse_getEllipseRadiusByAngle(angles.O2,ell2);
    return min_dist_ell_1+min_dist_ell_2;
}

function mot_ellipse_getTwoAngles(ellipse1, ellipse2){

    var switched = false;
    var angle1 = ellipse1.angle;//
    var angle2 = ellipse2.angle;//                                                                                    |
    //                                                                                                          III   |   IV
    // We do this for when one of the ellipses is in quadrant I and the other one in Quadrant IV.            _________|_________
    // We then need to be sure that the ellipse in Quadrant I becomes ellipse 2.                                      |
    // The rest of the calculation rest upon this assumption!                                                   II    |   I
    //                                                                                                                |
    //

    //We make sure that ellipse 2 has a greater angle than ellipse 1.                                       //      ellipse2 -> angle beta
    if(angle2 < angle1){                                                                                    //         |\
        var ell = ellipse1;                                                                                 //         |  \
        ellipse1 = ellipse2;                                                                                //         |    \ a
        ellipse2 = ell;                                                                                     //         |      \
        switched = true;                                                                                    //       c |        \
    }                                                                                                       //         |        / center_screen -> angle gamma
                                                                                                            //         |      /
    var a = mot_ellipse_distanceBetweenPoints(new Point(ellipse2.x,ellipse2.y),mot_ellipse_middleP);                                //         |    / b
    var b = mot_ellipse_distanceBetweenPoints(new Point(ellipse1.x,ellipse1.y),mot_ellipse_middleP);                                //         |  /
    var c = mot_ellipse_distanceBetweenPoints(new Point(ellipse1.x,ellipse1.y),new Point(ellipse2.x,ellipse2.y));       //         |/
    //      ellipse1 -> angle alpha
    var alpha = LawOfCosines_getalpha(a,b,c);
    var beta  = LawOfCosines_getbeta(a,b,c);
    var gamma = LawOfCosines_getgamma(a,b,c); //  Not needed

    var angle_ellipse1;
    var angle_ellipse2;
    if(switched){
        angle_ellipse2 = 360 - alpha;
        angle_ellipse1 = 360 - beta;
    }else{
        angle_ellipse1 = 360 - alpha;
        angle_ellipse2 = 360 - beta;
    }
    return {O1: angle_ellipse1, O2: angle_ellipse2, alpha: alpha, beta: beta};
}

/***********************
 *	OTHER FUNCTIONS
 ***********************/
function mot_ellipse_setCanvasAndContext() {
    mot_ellipse_canvas = document.getElementById("myCanvas");
    mot_ellipse_ctx = mot_ellipse_canvas.getContext("2d");
    mot_ellipse_ctx.canvas.height = window.innerHeight * 0.95;
    mot_ellipse_ctx.canvas.width = window.innerHeight * 0.95;

    var menu_dv = document.getElementById("menu_div");
    var menW = menu_dv.style.width;
    var mnW = menW.substring(0,3);
    var offs = -1*(window.innerWidth - mnW - mot_ellipse_ctx.canvas.width)/2+12.13;

    var slider = $('#slider');
    slider.css('width', mot_ellipse_ctx.canvas.width);
    slider.css('left', "35px");

    var canvas_dv = $("#canvas_div");
    canvas_dv.css('left',offs);

    var n_click_div = $('#num_clicks');
    var w = window.innerWidth - mot_ellipse_ctx.canvas.width - mnW - 40;
    n_click_div.css('width',w);
    n_click_div.css('height',mot_ellipse_ctx.canvas.height/2);
}

function mot_ellipse_createTrials(){
    trials = [];
    var verticalTrialsLeft = (MOT_ELLIPSES_NUMBER_OF_TRIALS_VERTICAL*MOT_ELLIPSES_NUMBER_OF_TRIALS);
    var horizontalTrialsLeft = MOT_ELLIPSES_NUMBER_OF_TRIALS - verticalTrialsLeft;
    if(horizontalTrialsLeft < 0) horizontalTrialsLeft = 0;
    for ( var iTrial = 0 ; iTrial < MOT_ELLIPSES_NUMBER_OF_TRIALS ; iTrial++ ){
        var horiz_total_ratio = horizontalTrialsLeft/(horizontalTrialsLeft+verticalTrialsLeft);
        var ori;
        if(Math.random() < horiz_total_ratio){
            ori = true;
            horizontalTrialsLeft--;
        }else{
            ori = false;
            verticalTrialsLeft--;
        }
        var trial = new mot_ellipse_Trial(MOT_ELLIPSES_NUMBER_OF_DOTS,Math.floor(MOT_ELLIPSES_IMPORTANT_FACTOR*MOT_ELLIPSES_NUMBER_OF_DOTS),ori,MOT_ELLIPSES_TEST_TIME);
        mot_ellipse_trials.push(trial);
    }
    console.log(mot_ellipse_trials);
}

function mot_ellipse_setupTrial(){
    mot_ellipse_determineRelatives(mot_ellipse_trials[mot_ellipse_trialNumber].orient);
    mot_ellipse_createDots(mot_ellipse_trials[mot_ellipse_trialNumber].numDots,mot_ellipse_trials[mot_ellipse_trialNumber].correctDots,mot_ellipse_trials[mot_ellipse_trialNumber].orient);
    mot_ellipse_trialNumber++;
}

function mot_ellipse_getFPSScreen() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;

    //noinspection JSUnresolvedVariable
    var start = performance.now();
    var nr_of_samples = 0;
    var samples = [];

    function step(timestamp) {
        var interval = timestamp - start;
        start = timestamp;
        if (nr_of_samples > 30) {
            mot_ellipse_calculateFPS(samples);
            return;
        } else if (nr_of_samples > 10) {
            samples.push(interval);
        }
        nr_of_samples++;
        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function mot_ellipse_calculateFPS(samples) {
    var average_interval = 0;
    for (var i = 0; i < samples.length; i++) {
        average_interval += samples[i];
    }
    average_interval = average_interval / samples.length;
    mot_ellipse_determineSpeed(average_interval);
    mot_ellipse_draw_interval = MOT_ELLIPSES_DRAW_INTERVAL;
    mot_ellipse_running = true;
    mot_ellipse_running_loop = setInterval(mot_ellipse_draw, mot_ellipse_draw_interval);

    $('#myCanvas').css('cursor',"none");
}

function mot_ellipse_determineSpeed(interval){
    var travel_distance = mot_ellipse_ctx.canvas.width;
    var hz = (1/interval)*1000;
}

function mot_ellipse_determineRelatives(orient){
    mot_ellipse_circle_radius = mot_ellipse_ctx.canvas.width * MOT_ELLIPSES_DOT_SIZE;
    mot_ellipse_max_radius = Math.sqrt(Math.pow(mot_ellipse_ctx.canvas.width/2,2)+Math.pow(mot_ellipse_ctx.canvas.height/2,2));
    MOT_ELLIPSES_MIN_DIST_CENTER = MOT_ELLIPSES_MOT_ELLIPSES_MIN_DIST_CENTER_PERC * mot_ellipse_ctx.canvas.width/2;
    if(orient){
        mot_ellipse_ellipse_width = mot_ellipse_max_radius * MOT_ELLIPSES_ELLIPSE_HEIGHT/4 * 0.8;
        mot_ellipse_ellipse_height = mot_ellipse_max_radius * MOT_ELLIPSES_ELLIPSE_WIDTH/4 * 0.8;
    } else {
        mot_ellipse_ellipse_width = mot_ellipse_max_radius * MOT_ELLIPSES_ELLIPSE_WIDTH/4 * 0.8;
        mot_ellipse_ellipse_height = mot_ellipse_max_radius * MOT_ELLIPSES_ELLIPSE_HEIGHT/4 * 0.8;
    }
    MOT_ELLIPSES_TARGET_RADIUS = Math.min(mot_ellipse_ellipse_height,mot_ellipse_ellipse_width)*MOT_ELLIPSES_MOT_ELLIPSES_MIN_DIST_CENTER_PERC*2;
    mot_ellipse_middleP = new Point(mot_ellipse_ctx.canvas.width/2,mot_ellipse_ctx.canvas.height/2);
}

function mot_ellipse_createDots(numD,impD,orient){
    mot_ellipse_dots = [];
    for (var i = 0 ; i < numD ; i++ ) {
        var location;
        var goodLocation = false;
        while(!goodLocation){
            location = mot_ellipse_getRandomLocation(orient);
            if(i < numD*MOT_ELLIPSES_SPAWN_IN_CENTER){
                if(mot_ellipse_distanceBetweenPoints(mot_ellipse_middleP,location) < mot_ellipse_ctx.canvas.height/4){
                    goodLocation = true;
                }else{
                    goodLocation = false;
                }
            }else{
                if(mot_ellipse_distanceBetweenPoints(mot_ellipse_middleP,location) < mot_ellipse_ctx.canvas.height/4){
                    goodLocation = false;
                }else{
                    goodLocation = true;
                }
            }
        }
        var angle = Math.random()*360;
        var imp = false;
       /* if( Math.random() < (impD-mot_ellipse_numImpDots)/(numD-mot_ellipse_dots.length) || (impD-mot_ellipse_numImpDots)/(numD-mot_ellipse_dots.length) >= 1){
            mot_ellipse_numImpDots++;
            imp = true;
        }      */
        var distanceToCenter = mot_ellipse_distanceBetweenPoints(location,mot_ellipse_middleP);
        var relativeDistance = distanceToCenter/mot_ellipse_max_radius;
        var size_modifier = (MOT_ELLIPSES_MAX_SIZE - MOT_ELLIPSES_MIN_SIZE) * relativeDistance + MOT_ELLIPSES_MIN_SIZE;
        mot_ellipse_dots.push(new mot_ellipse_Dot(new mot_ellipse_Ellipse(location.x, location.y,mot_ellipse_ellipse_width*size_modifier,mot_ellipse_ellipse_height*size_modifier,0),new Vector_Polar(Math.round(MOT_ELLIPSES_DOT_SPEED*mot_ellipse_ctx.canvas.width/1000),angle),(Math.random()/2)+0.25,imp));
    }

    //Now we will cycle through all dots and put some to be important.
    var QuadrantI = false;
    var QuadrantII = false;
    var QuadrantIII = false;
    var QuadrantIV = false;
    var important_made = 0;
    for( var iDot = 0 ; iDot < numD ; iDot++ ) {
        var pos;
        if( mot_ellipse_dots[iDot].ellipse.x < mot_ellipse_ctx.canvas.width/2 && mot_ellipse_dots[iDot].ellipse.y < mot_ellipse_ctx.canvas.height/2 ) pos = 1;
        if( mot_ellipse_dots[iDot].ellipse.x > mot_ellipse_ctx.canvas.width/2 && mot_ellipse_dots[iDot].ellipse.y < mot_ellipse_ctx.canvas.height/2 ) pos = 2;
        if( mot_ellipse_dots[iDot].ellipse.x < mot_ellipse_ctx.canvas.width/2 && mot_ellipse_dots[iDot].ellipse.y > mot_ellipse_ctx.canvas.height/2 ) pos = 3;
        if( mot_ellipse_dots[iDot].ellipse.x > mot_ellipse_ctx.canvas.width/2 && mot_ellipse_dots[iDot].ellipse.y > mot_ellipse_ctx.canvas.height/2 ) pos = 4;

        if( pos == 1 && !QuadrantI ) {
            QuadrantI = true;
            mot_ellipse_dots[iDot].important = true;
            important_made++;
        }
        if( pos == 2 && !QuadrantII ) {
            QuadrantII = true;
            mot_ellipse_dots[iDot].important = true;
            important_made++;
        }
        if( pos == 3 && !QuadrantIII ) {
            QuadrantIII = true;
            mot_ellipse_dots[iDot].important = true;
            important_made++;
        }
        if( pos == 4 && !QuadrantIV ) {
            QuadrantIV = true;
            mot_ellipse_dots[iDot].important = true;
            important_made++;
        }
    }
    // So now we have an important dot in every quadrant if possible
    var yet_to_make_important = impD - important_made;
    while(yet_to_make_important > 0 ){
        var element = Math.floor(Math.random()*mot_ellipse_dots.length);
        if( !mot_ellipse_dots[element].important ){
            mot_ellipse_dots[element].important = true;
            yet_to_make_important--;
        }
    }

    console.log(mot_ellipse_dots);
}

function mot_ellipse_getRandomLocation(orient){
    var gotLocation = false;
    var location;
    var whiles = 0;
    while (!gotLocation && whiles++ < 400){
        location = new Point(Math.random()*mot_ellipse_ctx.canvas.width,Math.random()*mot_ellipse_ctx.canvas.height);
        gotLocation = true;
        if( mot_ellipse_distanceBetweenPoints(location,mot_ellipse_middleP) > MOT_ELLIPSES_MIN_DIST_CENTER+mot_ellipse_ellipse_width+2){
            var distanceToCenter = mot_ellipse_distanceBetweenPoints(location,mot_ellipse_middleP);
            var relativeDistance = distanceToCenter/mot_ellipse_max_radius;
            var size_modifier = (MOT_ELLIPSES_MAX_SIZE - MOT_ELLIPSES_MIN_SIZE) * relativeDistance + MOT_ELLIPSES_MIN_SIZE;

            for( var i = 0 ; i < mot_ellipse_dots.length ; i++ ) {
                if((mot_ellipse_detectCollision(mot_ellipse_dots[i].ellipse, new mot_ellipse_Ellipse(location.x,location.y,mot_ellipse_ellipse_width*size_modifier,mot_ellipse_ellipse_height*size_modifier,0))) != "none"){
                    gotLocation = false;
                    break;
                }else if(orient && mot_ellipse_detectCollision_sides(mot_ellipse_dots[i].ellipse, new mot_ellipse_Ellipse(location.x,location.y,mot_ellipse_ellipse_width*size_modifier,mot_ellipse_ellipse_height*size_modifier,0))){
                    gotLocation = false;
                    break;
                }
            }

            var ell =  new mot_ellipse_Ellipse(location.x,location.y,mot_ellipse_ellipse_width*size_modifier,mot_ellipse_ellipse_height*size_modifier,0);

            if(!mot_ellipse_circleInBounds(new Circle(location.x,location.y,Math.max(ell.h,ell.w)+5))){
                gotLocation = false;
            }
        }else{
            gotLocation = false;
        }
    }
    return location;
}

function mot_ellipse_circleInBounds(circle){
    if(circle.x - circle.r <= 0) return false;
    if(circle.x + circle.r >= mot_ellipse_ctx.canvas.width) return false;
    if(circle.y - circle.r <= 0) return false;
    return circle.y + circle.r < mot_ellipse_ctx.canvas.height;
}

function radianToDegrees(ang){
    if(ang < 0) ang += (Math.PI * 2);
    return (ang * 360) / (Math.PI * 2);
}

function mot_ellipse_endTest(mot_ellipse_result){
    this.mot_ellipse_result = mot_ellipse_result;
}

function mot_ellipse_sendTheData(){
    var toStore = []
    //aantal, welke specifiek en of ze het waren.
    for ( var iDot = 0 ; iDot < mot_ellipse_dots.length ; iDot++ ) {
        if( mot_ellipse_dots[iDot].clicked){
            var important;
            if(mot_ellipse_dots[iDot].important)    important = "imp";
            else                        important = "nimp";
            toStore.push({nr: iDot, imp: important});
        }
    }
    var DATA = "";
    var direction;
    if(mot_ellipse_trials[mot_ellipse_trialNumber-1].orient)    direction = "horizontal";
    else                                direction = "vertical";
    DATA = DATA.concat(direction,"  ");
    DATA = DATA.concat(mot_ellipse_result,"  ");
    for( var iStore = 0 ; iStore < toStore.length ; iStore++ ) {
        DATA = DATA.concat(toStore[iStore].nr,"=",toStore[iStore].imp,"  ");
    }
    console.log(DATA);
    sendData(DATA,"MOT_E");
}

function mot_ellipse_startNextTrial(){
    mot_ellipse_test_paths.push(mot_ellipse_trial_paths);
    mot_ellipse_sendTheData();
    mot_ellipse_sendTrialPathToServer(mot_ellipse_trial_paths);
    if(mot_ellipse_trialNumber >= MOT_ELLIPSES_NUMBER_OF_TRIALS){
        mot_ellipse_done = true;
        console.log("mot_ellipse_done = true");
    }else{
        mot_ellipse_confirm_clicked = false;
        mot_ellipse_endViewTime = 0;
        mot_ellipse_endView = false;
        mot_ellipse_dots = [];
        mot_ellipse_result = 0;
        mot_ellipse_done = false;
        mot_ellipse_time = 0;
        mot_ellipse_numImpDots = 0;

        mot_ellipse_setupTrial();
        mot_ellipse_trial_paths = [];
        $('#myCanvas').css('cursor',"none");
    }
}

function mot_ellipse_storePaths(){
    var currentSpots = [];
    for( var iDot = 0 ; iDot < mot_ellipse_trials[mot_ellipse_trialNumber-1].numDots ; iDot++ ) {
        var pnt = new Point( Math.round(mot_ellipse_dots[iDot].ellipse.x) , Math.round(mot_ellipse_dots[iDot].ellipse.y) );
        currentSpots.push(pnt);
    }
    mot_ellipse_trial_paths.push(currentSpots);
}

function mot_ellipse_sendTrialPathToServer(trial_p) {
    var id = user[0];
    var trialnr = mot_ellipse_trialNumber-1;
    var ndots = mot_ellipse_trials[trialnr].numDots;
    for( var iTrial = 0 ; iTrial < trial_p.length ; iTrial++ ) {
        var data = "";
        var moment = trial_p[iTrial];
        for( var iMoment = 0 ; iMoment < moment.length ; iMoment++ ) {
            var str1 = moment[iMoment].x;
            var str2 = moment[iMoment].y;
            data = data.concat(str1,",",str2,",");
        }
        mot_ellipse_sendTrialRaw(id,"mote001",trialnr,ndots,"MOT_E",data);
    }
}

function mot_ellipse_sendTrialRaw(userid,testid,trialnr,numdots,test,data){
    var dat = "sendPath.php?userId="+userid+"&testId="+testid+"&trial="+trialnr+"&numDots="+numdots+"&test="+test+"&data="+data;
    sendToPHPFile(dat);
   /* $.ajax({
        type: "GET",
        url:  "https://perswww.kuleuven.be/~u0064325/GestaltDemos/Workspace/php/sendPath.php?userId="+userid+"&testId="+testid+"&trial="+trialnr+"&numDots="+numdots+"&test="+test+"&data="+data,
        //url: "http://127.0.0.1:8080/GestaltDemos/Workspace/php/sendPath.php?userId="+userid+"&testId="+testid+"&trial="+trialnr+"&numDots="+numdots+"&test="+test+"&data="+data,
        //url: "http://127.0.0.1:8080/LEP/php/sendPath.php?userId="+userid+"&testId="+testid+"&trial="+trialnr+"&numDots="+numdots+"&test="+test+"&data="+data,
        dataType: "json",
        statusCode: {
            200: function(mot_ellipse_result){
                // console.log(mot_ellipse_result.value);
            }
        }
    });  */
}