'use strict';

var numeral = require('numeral');

module.exports = function(microservice) {
    return {
        format: function(number, format, cb) {
            try {
                var formatted = numeral(number).format(format);
                return cb(null, formatted);
            } catch (e) {
                microservice.services['error'].notify(e);
                cb(e);
            }
        }
    };
};
