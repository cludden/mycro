'use strict';

var moment = require('moment');

module.exports = function(microservice) {
    return {
        format: function(date, format, cb) {
            var formatted = moment(date).format(format);
            if (formatted === 'Invalid date') {
                microservice.services['error'].notify(formatted);
                return cb(formatted);
            }
            cb(null, formatted);
        }
    };
};
