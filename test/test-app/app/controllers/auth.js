'use strict';

module.exports = {
    login: function(req, res) {
        req.mycro.log('silly', '[controller] auth.login options', req.options);
        res.json(200, {message: 'login successful!'});
    },

    logout: function(req, res) {
        req.mycro.log('silly', '[controller] auth.logout executed');
        res.json(200, {message: 'logout successful!'});
    }
};
