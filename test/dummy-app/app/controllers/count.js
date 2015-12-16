'use strict';

var count = 0;

module.exports = {
    getCount: function(req, res) {
        res.json(200, {count: count});
    },

    incrementCount: function(req, res) {
        res.json(200, {count: ++count});
    }
};
