'use strict';

var Mycro = require('../../index.js'),
    m = new Mycro();

m.start(function(err) {
    if (err) {
        m.log('error', err);
    } else {
        m.log('info', 'mycro started successfully');
    }
});
