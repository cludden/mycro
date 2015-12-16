'use strict';

module.exports = function(microservice) {
    return {
        reverseSubtract: function(a, b, cb) {
            return microservice.services['simple'].subtract(b, a, cb);
        }
    };
};
