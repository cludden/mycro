'use strict';

module.exports = function() {
    return {
        get: 'rest.find',
        post: 'rest.create',
        '/:id': {
            del: 'rest.remove',
            get: 'rest.detail',
            put: 'rest.update'
        }
    };
};
