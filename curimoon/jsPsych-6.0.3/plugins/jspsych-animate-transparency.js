/**
 * jsPsych plugin for animating transparency of image
 * Sander Van de Cruys
 *
 * 
 */

jsPsych.plugins["animate-transparency"] = (function () {

    var plugin = {};

    //jsPsych.pluginAPI.registerPreload('animate-transparency', 'stimuli', 'image');

    plugin.info = {
        name: 'animate-transparency',
        description: '',
        parameters: {
            stimuli: {
                type: jsPsych.plugins.parameterType.IMAGE,
                pretty_name: 'Stimuli',
                default: undefined,
                array: true,
                description: 'The images to be displayed.'
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: null,
                description: 'How long to show trial before it ends.'
            },
            choices: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                pretty_name: 'Choices',
                default: jsPsych.ALL_KEYS,
                array: true,
                description: 'Keys subject uses to respond to stimuli.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Any content here will be displayed below stimulus.'
            }
        }
    }

    plugin.trial = function (display_element, trial) {

        var startTime = (new Date()).getTime();
        var responses = [];

        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = "@keyframes fadeIn { from {opacity: 0;} to { opacity: 1;}} #bg {background: url(" + trial.stimuli[0] +") no-repeat;}";
        document.body.appendChild(css);
        
        var style = "opacity:0; animation: fadeIn " + trial.trial_duration/1000 + "s ease .2s forwards;"
        // show image

        display_element.innerHTML = '<div id="bg"><img src="' + trial.stimuli[1] + '" id="jspsych-animate-transparency-to-image" style="' +style+ '"></img></div>'
       

     
        
        if (trial.prompt !== null) {
            display_element.innerHTML += trial.prompt;
        }       

        var after_response = function (info) {

            responses.push({
                key_press: info.key,
                rt: info.rt,
                stimuli: trial.stimuli
            });

            // after a valid response, the stimulus will have the CSS class 'responded'
            // which can be used to provide visual feedback that a response was recorded
            display_element.querySelector('#jspsych-animate-transparency-from-image').className += ' responded';
        }

        // hold the jspsych response listener object in memory
        // so that we can turn off the response collection when
        // the trial ends
        var response_listener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: after_response,
            valid_responses: trial.choices,
            rt_method: 'date',
            persist: true,
            allow_held_key: false
        });

        function end_trial() {

            jsPsych.pluginAPI.cancelKeyboardResponse(response_listener);

            var trial_data = {
                "responses": JSON.stringify(responses)
            };

            jsPsych.finishTrial(trial_data);
        }

        // end trial if trial_duration is set
        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function () {
                end_trial();
            }, trial.trial_duration);
        }
    };

    return plugin;
})();
