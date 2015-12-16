/* jshint expr:true */
'use strict';

var chai = require('chai'),
    expect = chai.expect;

describe('[hook] server', function() {
    it('should attach the restify library at `microservice._restify`', function() {
        expect(microservice._restify).to.exist;
    });

    it('should create a restify server and make it available at `microservice.server`', function() {
        expect(microservice.server).to.be.instanceOf(require('restify/lib/server'));
    });
});
