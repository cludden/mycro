'use strict';

module.exports = function(mycro) {
    return {
        clear: function(req, res) {
            console.log('clear called');
            mycro.log('silly', '[controller] cache.clear');
            res.json(200, {message: 'cache cleared successfully'});
        }
    };
};
