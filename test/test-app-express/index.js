'use strict';

const Mycro = require('../../index.js');
const mycro = new Mycro();

mycro.start(function(err) {
    if (err) {
        mycro.log('error', err);
    } else {
        mycro.log('info', 'mycro started successfully');
    }
});
