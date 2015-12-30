'use strict';

module.exports = {
    define: function(fakeConnection) {
        var fakeSchema = {
            name: {
                type: 'string',
                required: true,
                unique: true
            }
        };

        return fakeConnection.model('groups', fakeSchema);
    },

    associations: {
        members: {
            type: 'belongsToMany',
            model: 'users'
        }
    }
};
