'use strict';

var moment = require('moment');

module.exports = function(mycro) {
    return {
        format: function(date, format, cb) {
            var formatted = moment(date).format(format);
            if (formatted === 'Invalid date') {
                mycro.services['error'].notify(formatted);
                return cb(formatted);
            }
            cb(null, formatted);
        }
    };
};
