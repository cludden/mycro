'use strict';

module.exports = {
    define: function(fakeConnection) {
        var fakeSchema = {
            first: {
                type: 'string',
                required: true
            },
            last: {
                type: 'string',
                required: true
            },
            email: {
                type: 'string',
                required: true,
                unique: true
            }
        };

        return fakeConnection.model('users', fakeSchema);
    },

    associations: {
        groups: {
            type: 'belongsToMany',
            model: 'groups'
        }
    }
};
