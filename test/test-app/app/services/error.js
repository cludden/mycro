'use strict';

module.exports = function(mycro) {
    return {
        notify: function(err) {
            mycro.log('error', err);
        }
    };
};
