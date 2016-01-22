'use strict';

var numeral = require('numeral');

module.exports = function(mycro) {
    return {
        format: function(number, format, cb) {
            try {
                var formatted = numeral(number).format(format);
                return cb(null, formatted);
            } catch (e) {
                mycro.services['error'].notify(e);
                cb(e);
            }
        }
    };
};
