'use strict';

module.exports = function(mycro) {
    return {
        login: function(req, res) {
            mycro.log('silly', '[controller] auth.login options', req.options);
            res.json(200, {message: 'login successful!'});
        },

        logout: function(req, res) {
            mycro.log('silly', '[controller] auth.logout executed');
            res.json(200, {message: 'logout successful!'});
        }
    };
};
