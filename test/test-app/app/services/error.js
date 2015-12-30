'use strict';

module.exports = function(microservice) {
    return {
        notify: function(err) {
            microservice.log('error', err);
        }
    };
};
