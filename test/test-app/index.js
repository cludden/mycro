'use strict';

var Microservice = require('restify-microservice'),
    m = new Microservice();

m.start(function(err) {
    if (err) {
        m.log('error', err);
    } else {
        m.log('info', 'microservice started successfully');
    }
});
