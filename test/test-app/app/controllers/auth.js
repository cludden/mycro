'use strict';

module.exports = {
    login: function(req, res) {
        req.microservice.log('silly', '[controller] auth.login executed');
        res.json(200, {message: 'login successful!'});
    },

    logout: function(req, res) {
        req.microservice.log('silly', '[controller] auth.logout executed');
        res.json(200, {message: 'logout successful!'});
    }
};
