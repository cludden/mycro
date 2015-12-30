/* jshint expr:true */
'use strict';

var asyncjs = require('async'),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect;

describe('[hook] services', function() {

    it('should load services at microservice.services', function() {
        expect(microservice.services).to.exist;
        expect(microservice.services['data']).to.exist;
    });


    it('should load object services', function() {
        var sum = microservice.services['math'].add(1, 2);
        expect(sum).to.equal(3);
    });


    it('should load function services', function() {
        expect(microservice.services['error']).to.be.an('object');
        expect(microservice.services['error'].notify).to.be.a('function');
    });


    it('should load non-first level services at the appropriate path', function() {
        expect(microservice.services['format/date']).to.be.an('object');
        expect(microservice.services['format/date'].format).to.be.a('function');
        expect(microservice.services['format/number']).to.be.an('object');
        expect(microservice.services['format/number'].format).to.be.a('function');
    });


    it('should enable services to utilize other services', function(done) {
        sinon.spy(microservice.services['error'], 'notify');
        microservice.services['format/date'].format('gibberish', 'YYYY MM DD', function(err, formatted) {
            expect(err).to.exist;
            expect(microservice.services['error'].notify).to.have.been.calledWith('Invalid date');
            done();
        });
    });
});
