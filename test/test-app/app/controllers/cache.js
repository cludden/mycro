'use strict';

module.exports = {
    clear: function(req, res) {
        req.microservice.log('silly', '[controller] cache.clear');
        res.json(200, {message: 'cache cleared successfully'});
    }
};
