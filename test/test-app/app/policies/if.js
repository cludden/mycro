'use strict';

module.exports = function(test, response) {
    return function(req, res, next) {
        var fakeRes = {
            json: function() {},
            status: function() {
                return {
                    send: function() {}
                };
            }
        };
        test(req, fakeRes, function(err) {
            if (err) return next(err);
            response(req, res, next);
        });
    };
};
