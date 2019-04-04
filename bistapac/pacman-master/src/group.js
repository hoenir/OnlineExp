/*
 * A way to group entities into a tree-like structure. The top-level group
 * is the global variable `objects'.
 *
 * Groups provide a relatively simple way to organise objects and send them
 * 'messages' (i.e. invoke methods on them).
 *
 * Members are internally stored in a map for fast lookup. Their iteration
 * order is defined by their respective `z' attributes. (Note: this is only
 * checked on insert.
 */

/*global copy, dispatch, idGenerator, keys */

function Group(props) {
    copy(props, this);
}

Group.prototype = {

    // Lookup member by name.
    get: function (id) {
        return this.members[id];
    },

    // Add a named member.
    set: function (id, o) {
        if (!this.members) {
            this.members = {};
            this.zIndex = [];
        }
        if (id in this.members) {
            // Remove previous incarnation
            this.remove(id);
        }
        this.members[id] = o;

        // Respect z-index order. An object added after another object with the
        // same z-index appears later in the index.
        if (o.z === undefined) {
            o.z = 0;
        }
        // Insertion sort
        var zIndex = this.zIndex;
        for (var i = 0; i < zIndex.length; i++) {
            if (o.z < zIndex[i].z) {
                break;
            }
        }
        zIndex.splice(i, 0, o);
        dispatch(o, 'invalidate');
    },

    // Add a group member and return its auto-generated ID.
    add: function (o) {
        if (!this.nextId) {
            this.nextId = idGenerator();
        }
        var id = this.nextId();
        this.set(id, o);
        return id;
    },

    remove: function (id) {
        var o = this.members[id];
        if (o) {
            delete this.members[id];
            this.zIndex.remove(o);
            dispatch(o, 'invalidate');
        }
        return o;
    },

    suspend: function (id) {
        this.get(id)._active = false;
    },

    resume: function (id) {
        this.get(id)._active = true;
    },

    // Returns the result of dispatching the given message to all members of the
    // group. To intercept specific messages, define a method with that name.
    // This function could then be manually called from within the handler to
    // continue propagating the message.
    dispatch: function (msg, args) {
        this.zIndex.forEach(function (o) {
            dispatch(o, msg, args);
        });
    },

    toString: function () {
        return 'Group [' + keys(this.members).length + ']';
    }
};
