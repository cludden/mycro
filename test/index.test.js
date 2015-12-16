/* jshint expr:true */
'use strict';

var chai = require('chai'),
    expect = chai.expect;

before(function(done) {
    process.chdir(__dirname + '/dummy-app');

    var Microservice = require('../'),
        microservice = new Microservice();
    global['microservice'] = microservice;
    
    microservice.start(function(err) {
        expect(err).to.not.exist;
        done(err);
    });
});
