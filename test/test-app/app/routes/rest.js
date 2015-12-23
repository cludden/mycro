'use strict';

module.exports = function(microservice) {
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
