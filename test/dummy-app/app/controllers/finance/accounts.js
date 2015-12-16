'use strict';

module.exports = {
    getBalance: function(req, res) {
        res.json(200, {balance: 123.45});
    }
};
