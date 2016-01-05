'use strict';

module.exports = function() {
    return {
        '/healthy': {
            get: function(req, res) {
                res.json(200, {status: 'healthy'});
            }
        }
    };
};
