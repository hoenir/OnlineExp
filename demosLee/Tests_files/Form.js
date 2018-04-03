/********************************************************************
 *
 *	Project Name: Form
 *	Version: 1.0 (31-July-2013)
 *	Author: Thomas Hendrickx
 *
 *	Contains the necessary functions for filling in the form.
 *
 ********************************************************************/

var CHEATKEYONE = 68;
var CHEATKEYTWO = 69;
var CHEATKEYTHREE = 77;

var user;
var form_running_test;
var demo_notTest = false;
var keys_pressed = [];

function initialise_form(test){
    form_running_test = test;
    $(function() {
        $( "#slider" ).slider({
            value: 0
        });
    });

    formatForm();
}

function formatForm(){
    var height = window.innerHeight * 0.88;
    var width = window.innerHeight * 0.88;

    var slider = $('#slider_wrapper');
    slider.css('width',width);
    slider.css('display',"none");

    var form_div = $('#form_div');
    form_div.css('width',width);
    form_div.css('height',width);
    form_div.css('vertical-align', "middle");

    var nav_width = (window.innerWidth-width)/2 - 12;

    var menu = $('#menu_div');
    menu.css('width',nav_width);
    menu.css('height',25);

    var nav = $('#main_nav');
    nav.css('width',nav_width);
    nav.css('height',height*0.95);

    var form = $('#form');
    form.css('width',width *.5);
    form.css('display',"block");

    var canvas = $('#canvas_div');
    canvas.css('display',"none");

    var numItems = $("#menu_div").children('ul').length;
    var width = menu.width() /numItems;
    $("menu_list").width = width;

    var txt_id = $("#f_id");
    var txt_age = $("#f_age");
    var btn_submit = $("submit");

    txt_id.keyup(function(event){
        if(event.keyCode == 13){
            submit_function();
        }
    });
    txt_age.keyup(function(event){
        if(event.keyCode == 13){
            submit_function();
        }
    });
}

function bypassform(test){
    form_running_test = test;
    formatForm();
    user = ["demo"];
    setNewContent();
}

function submit_function(){
    var id = document.getElementById("f_id").value;
    var age = document.getElementById("f_age").value;
    var gender = document.getElementById("f_gender").value;
    var gen;
    if(gender === "Male") gen = "m";
    if(gender === "Female") gen = "f";
    if(validate_data(id,age)){
        var tosend = [id,age,gen];
        user = tosend;
        setNewContent();
        return false;
    }else{
        return false;
    }
}

function validate_data(id,age){
    if(!isValidID(id)){
        document.getElementById("f_id").value = "invalid";
        return false;
    }
    if(age > 0 && age < 150){
        return true;
    }
    document.getElementById("f_age").value = "invalid";
    return false;
}

function isValidID(id){
    //TODO needs to be implemented!!!
    return true;
}

function sendData(data,test){
    if(user[0] == "demo") return;
    $.ajax({
        type: "GET",
        url:  "https://perswww.kuleuven.be/~u0064325/GestaltDemos/Workspace/php/sendData.php?id="+user[0]+"&age="+user[1]+"&gender="+user[2]+"&data="+data+"&test="+test,
        //url: "http://127.0.0.1:8080/GestaltDemos/Workspace/php/sendData.php?id="+user[0]+"&age="+user[1]+"&gender="+user[2]+"&data="+data+"&test="+test,
        //url: "http://127.0.0.1:8080/LEP/php/sendData.php?id="+user[0]+"&age="+user[1]+"&gender="+user[2]+"&data="+data+"&test="+test,
        dataType: "json",
        statusCode: {
            200: function(result){
            }
        }
    });
}

function setNewContent(){
    var form_div = $('#form_div');
    form_div.css('height',"0px");
    form_div.css('border',"1px solid #FFFFFF");

    var canvas = $('#canvas_div');
    canvas.css('display',"inline");

    var slider = $('#slider_wrapper');
    slider.css('display',"inline");

    switch(form_running_test){
        case 'balls':
            balls_init();
            break;
        case 'causality':
            causality_init();
            break;
        case 'Kanizsa_Square':
            Kanizsa_Square_init();
            break;
        case 'randomDots':
            randomDots_init();
            break;
        case 'sphere':
            sphere_init();
            break;
        case 'square':
            square_init();
            break;
        case 'mot':
            mot_init();
            break;
        case 'mot_ellipse':
            mot_ellipse_init();
            break;
        default:
            init();
            break;
    }
}

function startNewTest(demo,test){
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    document.getElementById('n_cl').innerHTML = "";
    $("#n_cl").css('font-size',ctx.canvas.height * 0.025);
    document.getElementById('n_click').innerHTML = "";
    $("#n_click").css('font-size',ctx.canvas.height * 0.025);
    document.getElementById('n_cl_info').innerHTML = "";
    $("#n_cl_info").css('font-size',ctx.canvas.height * 0.025);

    /*switch(form_running_test){
        case 'balls':     */
            if(balls_running) balls_stop();
           /* break;
        case 'causality':                */
            if(causality_running) causality_stop();
            /*break;
        case 'Kanizsa_square':          */
            if(Kanizsa_Square_running) Kanizsa_Square_stop();
          /*  break;
        case 'randomDots':     */
            if(randomDots_running) randomDots_stop();
           /* break;
        case 'sphere': */
            if(sphere_running) sphere_stop();
          /*  break;
        case 'square':  */
            if(square_running) square_stop();
           /* break;
        case 'mot': */
            if(mot_running) mot_stop();
           /* break;
        case 'mot_ellipse': */
            if(mot_ellipse_running) mot_ellipse_stop();
          /*  break;
        default:
            break;
    }             */

    setSelectedButton(test);

    if(demo_notTest){
        bypassform(test);
    }else{
        initialise_form(test);
    }
}

function setSelectedButton(new_test){
    var colour;

    if(new_test == 'balls') colour = "#3b3b3b";
    else colour = "#1e7c9a";
    $("#balls_link").css("background",colour);

    if(new_test == 'causality') colour = "#3b3b3b";
    else colour = "#1e7c9a";
    $("#causality_link").css("background",colour);

    if(new_test == 'Kanizsa_Square') colour = "#3b3b3b";
    else colour = "#1e7c9a";
    $("#Kanizsa_square_link").css("background",colour);

    if(new_test == 'mot') colour = "#3b3b3b";
    else colour = "#1e7c9a";
    $("#mot_link").css("background",colour);

    if(new_test == 'mot_ellipse') colour = "#3b3b3b";
    else colour = "#1e7c9a";
    $("#mot_ellipse_link").css("background",colour);

    if(new_test == 'randomDots') colour = "#3b3b3b";
    else colour = "#1e7c9a";
    $("#randomDots_link").css("background",colour);

    if(new_test == 'sphere') colour = "#3b3b3b";
    else colour = "#1e7c9a";
    $("#sphere_link").css("background",colour);

    if(new_test == 'square') colour = "#3b3b3b";
    else colour = "#1e7c9a";
    $("#square_link").css("background",colour);
}

function sendToPHPFile(dat){
    if(user[0] == "demo") return;
    $.ajax({
        type: "GET",
        url:  "https://perswww.kuleuven.be/~u0064325/GestaltDemos/Workspace/php/"+dat,
        //url: "http://127.0.0.1:8080/GestaltDemos/Workspace/php/"+dat,
        //url: "http://127.0.0.1:8080/LEP/php/"+dat,
        dataType: "json",
        statusCode: {
            200: function(mot_ellipse_result){
                // console.log(mot_ellipse_result.value);
            }
        }
    });
}

function init(){
    //setting the eventListnerers
    window.addEventListener("keydown",doKeyDown,false);
    window.addEventListener("mousedown", deMouseDown, false);
    window.addEventListener("mouseup", deMouseUp, false);
    window.addEventListener("mousemove", deMouseMove, false);

    $("#main_div").css("background",'#FFFFFF');

    startNewTest(false,'balls');
}

function deMouseUp(e){
    switch(form_running_test){
        case 'balls':
            if(balls_running) balls_doMouseUp(e);
            break;
        case 'causality':
            if(causality_running) causality_doMouseUp(e);
            break;
        case 'Kanizsa_Square':
            if(Kanizsa_Square_running) Kanizsa_Square_doMouseUp(e);
            break;
        case 'randomDots':
            if(randomDots_running) randomDots_doMouseUp(e);
            break;
        case 'sphere':
            sphere_doMouseUp(e);
            break;
        case 'square':
            square_doMouseUp(e);
            break;
        case 'mot':
            mot_doMouseUp(e);
            break;
        case 'mot_ellipse':
            mot_ellipse_doMouseUp(e);
            break;
        default:
            break;
    }
}

function deMouseMove(e){

    hoveringElements(e);

    switch(form_running_test){
        case 'balls':
            if(balls_running) balls_doMouseMove(e);
            break;
        case 'causality':
            if(causality_running) causality_doMouseMove(e);
            break;
        case 'Kanizsa_Square':
            if(Kanizsa_Square_running) Kanizsa_Square_doMouseMove(e);
            break;
        case 'randomDots':
            if(randomDots_running) randomDots_doMouseMove(e);
            break;
        case 'sphere':
            sphere_doMouseMove(e);
            break;
        case 'square':
            square_doMouseMove(e);
            break;
        case 'mot':
            mot_doMouseMove(e);
            break;
        case 'mot_ellipse':
            mot_ellipse_doMouseMove(e);
            break;
        default:
            break;
    }
}

function hoveringElements(e){
    var x = e.pageX;
    var y = e.pageY;

    var balls_link = document.getElementById('balls_link');
    if(inRectangle(x,y,balls_link.getBoundingClientRect()) || form_running_test == 'balls'){
        $("#balls_link").css("background","#3b3b3b");
    }else{
        $("#balls_link").css("background","#1e7c9a");
    }

    var square_link = document.getElementById('square_link');
    if(inRectangle(x,y,square_link.getBoundingClientRect()) || form_running_test == 'square'){
        $("#square_link").css("background","#3b3b3b");
    }else{
        $("#square_link").css("background","#1e7c9a");
    }

    var randomDots_link = document.getElementById('randomDots_link');
    if(inRectangle(x,y,randomDots_link.getBoundingClientRect()) || form_running_test == 'randomDots'){
        $("#randomDots_link").css("background","#3b3b3b");
    }else{
        $("#randomDots_link").css("background","#1e7c9a");
    }

    var causality_link = document.getElementById('causality_link');
    if(inRectangle(x,y,causality_link.getBoundingClientRect()) || form_running_test == 'causality'){
        $("#causality_link").css("background","#3b3b3b");
    }else{
        $("#causality_link").css("background","#1e7c9a");
    }

    var sphere_link = document.getElementById('sphere_link');
    if(inRectangle(x,y,sphere_link.getBoundingClientRect()) || form_running_test == 'sphere'){
        $("#sphere_link").css("background","#3b3b3b");
    }else{
        $("#sphere_link").css("background","#1e7c9a");
    }

    var mot_link = document.getElementById('mot_link');
    if(inRectangle(x,y,mot_link.getBoundingClientRect()) || form_running_test == 'mot'){
        $("#mot_link").css("background","#3b3b3b");
    }else{
        $("#mot_link").css("background","#1e7c9a");
    }

    var mot_ellipse_link = document.getElementById('mot_ellipse_link');
    if(inRectangle(x,y,mot_ellipse_link.getBoundingClientRect()) || form_running_test == 'mot_ellipse'){
        $("#mot_ellipse_link").css("background","#3b3b3b");
    }else{
        $("#mot_ellipse_link").css("background","#1e7c9a");
    }

    var Kanizsa_square_link = document.getElementById('Kanizsa_square_link');
    if(inRectangle(x,y,Kanizsa_square_link.getBoundingClientRect()) || form_running_test == 'Kanizsa_Square'){
        $("#Kanizsa_square_link").css("background","#3b3b3b");
    }else{
        $("#Kanizsa_square_link").css("background","#1e7c9a");
    }
}

function inRectangle(x,y,rect){
    if(x < rect.left || x > rect.right ) return false;
    if(y < rect.top  || y > rect.bottom) return false;
    return true;
}

function deMouseDown(e){
    switch(form_running_test){
        case 'balls':
            if(balls_running) balls_doMouseDown(e);
            break;
        case 'causality':
            if(causality_running) causality_doMouseDown(e);
            break;
        case 'Kanizsa_Square':
            if(Kanizsa_Square_running) Kanizsa_Square_doMouseDown(e);
            break;
        case 'randomDots':
            if(randomDots_running) randomDots_doMouseDown(e);
            break;
        case 'sphere':
            sphere_doMouseDown(e);
            break;
        case 'square':
            square_doMouseDown(e);
            break;
        case 'mot':
            mot_doMouseDown(e);
            break;
        case 'mot_ellipse':
            mot_ellipse_doMouseDown(e);
            break;
        default:
            break;
    }
}

function checkKeys(keys,keycode){
    if( keys.length < 2 ) return;
    console.log("checking keys");
    if(keys[0] == CHEATKEYONE ){
        console.log("first key was good");
        if(keys[1] == CHEATKEYTWO ){
            console.log("2d key was good");
            if( keycode == CHEATKEYTHREE ){
                console.log("3th key was good");
                demo_notTest = !demo_notTest;
                if(demo_notTest) document.getElementById('DEMO_SHOW').innerHTML = "DEMO";
                else             document.getElementById('DEMO_SHOW').innerHTML = "";

                //$("#DEMO_SHOW").css('font-size',20);
                return [];
            }
        }
    }
    console.log("wrong key combination");
    return [keys[1],keycode];
}

function doKeyDown(e){

    if(keys_pressed.length >= 2){
        console.log("3th key is pressed");
        keys_pressed = checkKeys(keys_pressed, e.keyCode);
    }else{
        console.log("1th or 2d key is pressed");
        keys_pressed.push(e.keyCode);
    }

    console.log(e.keyCode);

    switch(form_running_test){
        case 'balls':
            if(balls_running) balls_doKeyDown(e);
            break;
        case 'causality':
            if(causality_running) causality_doKeyDown(e);
            break;
        case 'Kanizsa_Square':
            if(Kanizsa_Square_running) Kanizsa_Square_doKeyDown(e);
            break;
        case 'randomDots':
            if(randomDots_running) randomDots_doKeyDown(e);
            break;
        case 'sphere':
            if(sphere_running) sphere_doKeyDown(e);
            break;
        case 'square':
            if(square_running) square_doKeyDown(e);
            break;
        case 'mot':
            if(mot_running) mot_doKeyDown(e);
            break;
        case 'mot_ellipse':
            if(mot_ellipse_running) mot_ellipse_doKeyDown(e);
            break;
        default:
            break;
    }
}