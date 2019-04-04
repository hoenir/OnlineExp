/*
 * Sound manager.
 */

/*global Audio, debug, format, keys, noop, values */

// Hack for browsers that don't support audio requirements
function DummySoundManager() {}

DummySoundManager.prototype = {
    play: noop,
    togglePause: noop,
    enable: noop,
    killAll: noop
};

function SoundManager(sounds) {
    // XXX: hack for Safari testing
    if (values(sounds).some(function (sound) { return !sound; })) {
        return new DummySoundManager();
    }

    // Copies of each sound are made in case a play request occurs while the
    // original is playing. Borrowed from
    // http://www.phoboslab.org/log/2011/03/multiple-channels-for-html5-audio
    this.sounds = {};
    keys(sounds).forEach(function (k) {
        var sound = sounds[k];
        var channels = [sound];
        // For this game, the number of channels is determined by the length
        // of the dot-eaten sound effect and the rate at which Pac-Man may
        // consume dots. With Pac-Man moving at 60px/sec, and dots about 8px
        // apart, the sound effect could be played up to 8 times per second. The
        // sound is just under a second long, so the number of required channels
        // is 8.
        var nCopies = 7;
        for (var i = 0; i < nCopies; i++) {
            channels.push(sound.cloneNode(true));
        }
        this.sounds[k] = channels;
    }, this);

    this.playing = [];
    this.enabled = true;
    this.nclones = 0;
}

SoundManager.formats = {
    ogg: 'audio/ogg; codecs="vorbis"'
};

SoundManager.load = function (id, path, onLoad, onError) {
    var aud = new Audio();

    var exts = keys(SoundManager.formats);
    var ext = exts.first(function (ext) {
        return aud.canPlayType(SoundManager.formats[ext]);
    });

    if (!ext) {
        // onError(format('No required audio formats (%s) are supported',
        //                exts.join(', ')));
        onLoad(null);
        return;
    }

    // guard against multiple onload events
    var loaded;
    aud.addEventListener('canplaythrough', function (e) {
        if (!loaded) {
            loaded = true;
            debug('loaded audio: %s', this.src);
            onLoad(aud);
        }
    }, false);
    aud.addEventListener('error', function (e) {
        onError(format('Error loading audio: %s', e.src));
    }, false);
    aud.src = format('%s/%s.ogg', path, id);
    aud.load();
};

SoundManager.prototype = {

    play: function (id) {
        if (!this.enabled) {
            return;
        }
        var channels = this.sounds[id];
        // find the first sound not playing
        var sound = channels.first(function (s) {
            return !s.playing;
        });

        if (!sound) {
            debug('can\'t play %s; skipping', id);
            return;
        }

        sound.playing = true;
        sound.addEventListener('ended', function () {
            sound.playing = false;
        }, false);
        sound.play();
    },

    currentlyPlaying: function () {
        var playing = values(this.sounds).map(function (channels) {
            return channels.filter(function (sound) {
                return sound.playing;
            });
        });
        return Array.prototype.concat.apply([], playing);
    },

    togglePause: function (paused) {
        this.currentlyPlaying().forEach(function (sound) {
            if (paused) {
                sound.pause();
            } else {
                sound.play();
            }
        });
    },

    enable: function (enabled) {
        if (!enabled) {
            this.killAll();
        }
        this.enabled = enabled;
    },

    killAll: function () {
        this.currentlyPlaying().forEach(function (sound) {
            sound.playing = false;
            // XXX: is there a better way to kill sounds?
            sound.pause();
            sound.currentTime = 0;
        });
    }
};
