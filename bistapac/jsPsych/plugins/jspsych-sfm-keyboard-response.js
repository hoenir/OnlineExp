/**
 * jspsych-sfm-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["sfm-keyboard-response"] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'image-keyboard-response',
    description: '',
    parameters: {
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      dot_color: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Dot color",
        default: "white",
        description: "The color of the dots"
      },
      background_color: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Background color",
        default: "white",
        description: "The background of the stimulus"
      },
      fig: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'sfm figure',
        default: 'plw',
        description: 'sphere or plw'
      },
      sfm_level: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'sfm level',
        default: 1,
        description: 'sphere or plw'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
    }
  }

  plugin.trial = function (display_element, trial) {


    trial.dot_color = assignParameterValue(trial.dot_color, "white");
    trial.background_color = assignParameterValue(trial.background_color, "white");
    //console.log(trial.choices);



    //--------Set up Canvas begin-------

    //Create a canvas element and append it to the DOM
    var canvas = document.createElement("canvas");
    display_element.appendChild(canvas);


    //The document body IS 'display_element' (i.e. <body class="jspsych-display-element"> .... </body> )
    var body = document.getElementsByClassName("jspsych-display-element")[0];

    //Save the current settings to be restored later
    var originalMargin = body.style.margin;
    var originalPadding = body.style.padding;
    var originalBackgroundColor = body.style.backgroundColor;

    //Remove the margins and paddings of the display_element
    body.style.margin = 0;
    body.style.padding = 0;
    body.style.backgroundColor = trial.background_color; //Match the background of the display element to the background color of the canvas so that the removal of the canvas at the end of the trial is not noticed

    //Remove the margins and padding of the canvas
    canvas.style.margin = 0;
    canvas.style.padding = 0;

    //Get the context of the canvas so that it can be painted on.
    var ctx = canvas.getContext("2d");

    //Declare variables for width and height, and also set the canvas width and height to the window width and height
    var canvasWidth = canvas.width = window.innerWidth - 200;
    var canvasHeight = canvas.height = window.innerHeight - 200;

    // clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    //Set the canvas background color
    canvas.style.backgroundColor = trial.background_color;

    //--------Set up Canvas end-------


    ratios = [.25, .5, .75] // levels of sphere fig 
    if (trial.fig == 'sphere') {
      sphere_input_ratio = ratios[trial.sfm_level];
      // init sphere vars
      var sphere_G_SphereRotationCounter = 0;
      var sphere_G_SphereDotArray = new Array(3);

      var SPHERE_NUM_SPHEREDOTS = 350;
      var spheresize = .2;
      initialiseArray(); // initialize sphere array

    }
    coordset = [COORDS1, COORDSmin2, COORDSmin5] // levels (perspective) of plw fig
    if (trial.fig == 'plw') {
      coordsUsed = coordset[trial.sfm_level];
      // init plw vars
      var dotsperframe = 15,
        dotsize = 5,
        nrframes = coordsUsed.length / 15, // set plw frames
        framecounter = 0,
        counter = 0,
        x = 0,
        y = 0,
        plwsize = 40;
    }





    //--------init SFM values end-------


    //Initialize stopping condition for animateDotMotion function that runs in a loop
    var stopDotMotion = false;

    //Variable to control the frame rate, to ensure that the first frame is skipped because it follows a different timing
    var firstFrame = true; //Used to skip the first frame in animate function below (in animateDotMotion function)

    //Variable to start the timer when the time comes
    var timerHasStarted = false;

    //Initialize object to store the response data. Default values of -1 are used if the trial times out and the subject has not pressed a valid key
    var response = {
      rt: -1,
      key: -1
    }

    //Declare a global timeout ID to be initialized below in animateDotMotion function and to be used in after_response function
    var timeoutID;

    //Declare global variable to be defined in startKeyboardListener function and to be used in end_trial function
    var keyboardListener;

    //Declare global variable to store the frame rate of the trial
    var frameRate = []; //How often the monitor refreshes, in ms. Currently an array to store all the intervals. Will be converted into a single number (the average) in end_trial function.

    //variable to store how many frames were presented.
    var numberOfFrames = 0;

    //This runs the dot motion simulation, updating it according to the frame refresh rate of the screen.
    animateSFM();

    //Function to start the keyboard listener
    function startKeyboardListener() {
      //Start the response listener if there are choices for keys
      if (trial.choices != jsPsych.NO_KEYS) {
        //Create the keyboard listener to listen for subjects' key response
        keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response, //Function to call once the subject presses a valid key
          valid_responses: trial.choices, //The keys that will be considered a valid response and cause the callback function to be called
          rt_method: 'performance', //The type of method to record timing information. 
          persist: false, //If set to false, keyboard listener will only trigger the first time a valid key is pressed. If set to true, it has to be explicitly cancelled by the cancelKeyboardResponse plugin API.
          allow_held_key: false //Only register the key once, after this getKeyboardResponse function is called. (Check JsPsych docs for better info under 'jsPsych.pluginAPI.getKeyboardResponse').
        });
      }
    }



    function drawCircle(c, colour) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
      ctx.fillStyle = colour;
      ctx.fill();
    }

    function drawRectangle(r, colour) {
      ctx.beginPath();
      ctx.rect(r.x, r.y, r.width, r.height);
      ctx.fillStyle = colour;
      ctx.fill();
    }

    function updateAndDraw() {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      if (trial.fig == 'sphere') {
        drawSphere(sphere_input_ratio);
        sphere_G_SphereRotationCounter++;
        if (sphere_G_SphereRotationCounter >= 360) sphere_G_SphereRotationCounter = 0;
      }
      if (trial.fig == 'plw') {
        drawPlw();
      }

    }

    //CopyPaste of the C# function made by Mr. Lee de-Wit
    function drawSphere(RatioUsed) {
      var AVG_BALL_SIZE = 3;
      var myLocalColor = 0;
      var CosChange;
      var InCosChange;

      for (var iDot = 0; iDot < SPHERE_NUM_SPHEREDOTS; iDot++) {
        CosChange = RatioUsed * (Math.cos((2 * Math.PI) / 360 * sphere_G_SphereDotArray[2][iDot][sphere_G_SphereRotationCounter]));
        InCosChange = (1 - RatioUsed) * (Math.cos((2 * Math.PI) / 360 * (sphere_G_SphereDotArray[2][iDot][sphere_G_SphereRotationCounter])));
        myLocalColor = Math.round(180 - (30 * CosChange) + (30 * InCosChange));

        var BallsSize = AVG_BALL_SIZE //+ (2 * CosChange) - (2 * InCosChange);

        drawCircle(new Circle(sphere_G_SphereDotArray[0][iDot][sphere_G_SphereRotationCounter], sphere_G_SphereDotArray[1][iDot][sphere_G_SphereRotationCounter], BallsSize), "rgb(" + myLocalColor + "," + myLocalColor + "," + myLocalColor + ")");
      }
    }

    function drawPlw() {
      //get coords for current frame
      thisCoords = coordsUsed.slice(framecounter * dotsperframe, (framecounter + 1) * dotsperframe);

      //run through individual dots
      for (var i = 0; i < dotsperframe; i++) {

        x = (thisCoords[i][0] * plwsize) + canvasWidth / 2;
        y = (-thisCoords[i][1] * plwsize) + canvasHeight / 2;
        drawCircle(new Circle(x, y, dotsize), "black");

      }
      //set next frame

      //framecounter = (counter % 2 == 0 ? framecounter : framecounter + 1);
      framecounter = framecounter+2
      //counter++;
      if (framecounter >= nrframes) {
        framecounter = 0;
        //counter = 0;
      }
    }


    function initialiseArray() {
      var mySW = canvasWidth / 2;
      var mySH = canvasHeight / 2;
      var Ylength;
      var Radius = mySW * spheresize;
      var RandDotPhase = new Array(SPHERE_NUM_SPHEREDOTS);

      for (var i = 0; i < sphere_G_SphereDotArray.length; i++) {
        sphere_G_SphereDotArray[i] = new Array(SPHERE_NUM_SPHEREDOTS);
        for (var j = 0; j < sphere_G_SphereDotArray[i].length; j++) {
          sphere_G_SphereDotArray[i][j] = new Array(360);
        }
      }

      for (var i = 0; i < SPHERE_NUM_SPHEREDOTS; i++) {
        RandDotPhase[i] = Math.random() * 360;
      }

      for (var iDegree = 0; iDegree < 360; iDegree++) {
        for (var iDot = 0; iDot < SPHERE_NUM_SPHEREDOTS; iDot++) {
          Ylength = Math.cos((2 * Math.PI) / 360 * ((iDot / SPHERE_NUM_SPHEREDOTS) * 360)) * Radius;
          sphere_G_SphereDotArray[0][iDot][iDegree] = Math.sin((2 * Math.PI) / 360 * ((iDegree + RandDotPhase[iDot]) % 360)) * (Math.sqrt((Radius * Radius) - (Ylength * Ylength))) + mySW;
          sphere_G_SphereDotArray[1][iDot][iDegree] = Ylength + mySH;
          sphere_G_SphereDotArray[2][iDot][iDegree] = (iDegree + RandDotPhase[iDot]) % 360;
        }
      }
    }

    //Function to make the dots move on the canvas
    function animateSFM() {
      //frameRequestID saves a long integer that is the ID of this frame request. The ID is then used to terminate the request below.
      var frameRequestID = window.requestAnimationFrame(animate);

      //Start to listen to subject's key responses
      startKeyboardListener();

      //Delare a timestamp
      var previousTimestamp;

      function animate() {
        //If stopping condition has been reached, then stop the animation
        if (stopDotMotion) {
          window.cancelAnimationFrame(frameRequestID); //Cancels the frame request
          //Remove the canvas as the child of the display_element element
			    display_element.innerHTML='';
        }
        //Else continue with another frame request
        else {
          frameRequestID = window.requestAnimationFrame(animate); //Calls for another frame request

          //If the timer has not been started and it is set, then start the timer
          if ((!timerHasStarted) && (trial.stimulus_duration > 0)) {
            //If the trial duration is set, then set a timer to count down and call the end_trial function when the time is up
            //(If the subject did not press a valid keyboard response within the trial duration, then this will end the trial)
            timeoutID = window.setTimeout(function(){stopDotMotion=true; }, trial.stimulus_duration); //This timeoutID is then used to cancel the timeout should the subject press a valid key
            //The timer has started, so we set the variable to true so it does not start more timers
            timerHasStarted = true;
          }

          updateAndDraw(); //Update and draw each of the dots

          //If this is before the first frame, then start the timestamp
          if (previousTimestamp === undefined) {
            previousTimestamp = performance.now();
          }
          //Else calculate the time and push it into the array
          else {
            var currentTimeStamp = performance.now(); //Variable to hold current timestamp
            frameRate.push(currentTimeStamp - previousTimestamp); //Push the interval into the frameRate array
            previousTimestamp = currentTimeStamp; //Reset the timestamp
          }
        }
      }
    }




    //Function to end the trial proper
    function end_trial() {

      //Stop the dot motion animation
      stopDotMotion = true;

      //Store the number of frames
      numberOfFrames = frameRate.length;

      //Variable to store the frame rate array
      var frameRateArray = frameRate;

      //Calculate the average frame rate
      if (frameRate.length > 0) { //Check to make sure that the array is not empty
        frameRate = frameRate.reduce((total, current) => total + current) / frameRate.length; //Sum up all the elements in the array
      } else {
        frameRate = 0; //Set to zero if the subject presses an answer before a frame is shown (i.e. if frameRate is an empty array)
      }

      //Kill the keyboard listener if keyboardListener has been defined
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      //Place all the data to be saved from this trial in one data object
      var trial_data = {
        "rt": response.rt, //The response time
        "key_press": response.key, //The key that the subject pressed
        "choices": trial.choices, //The set of valid keys
        "stimulus_duration": trial.stimulus_duration, //The stimulus duration 
        "response_ends_trial": trial.response_ends_trial, //If the response ends the trial
        "dot_color": trial.dot_color,
        "background_color": trial.background_color,
        "fig": trial.fig,
        "sfm_level": trial.sfm_level,
        "frame_rate": frameRate, //The average frame rate for the trial
        "frame_rate_array": JSON.stringify(frameRateArray), //The array of ms per frame in this trial, in the form of a JSON string
        "number_of_frames": numberOfFrames, //The number of frames in this trial
        "canvas_width": canvasWidth,
        "canvas_height": canvasHeight

      }

      console.log(trial_data);
     
      //Restore the settings to JsPsych defaults
      body.style.margin = originalMargin;
      body.style.padding = originalPadding;
      body.style.backgroundColor = originalBackgroundColor

      //End this trial and move on to the next trial
      jsPsych.finishTrial(trial_data);

    } //End of end_trial

    //Function to record the first response by the subject
    function after_response(info) {

      //If the response has not been recorded, record it
      if (response.key == -1) {
        response = info; //Replace the response object created above
      }

      //If the parameter is set such that the response ends the trial, then kill the timeout and end the trial
      if (trial.response_ends_trial) {
        window.clearTimeout(timeoutID);
        end_trial();
      }

    } //End of after_response

    //Function to assign the default values for the staircase parameters
    function assignParameterValue(argument, defaultValue) {
      return typeof argument !== 'undefined' ? argument : defaultValue;
    }


    /******************************
     *	OBJECTS
     ******************************/

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

  };

  return plugin;
})();