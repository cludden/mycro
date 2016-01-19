/* jshint expr:true */
'use strict';

var chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect;

describe('[hook] services', function() {

    it('should load services at mycro.services', function() {
        expect(mycro.services).to.exist;
        expect(mycro.services['data']).to.exist;
    });


    it('should load object services', function() {
        var sum = mycro.services['math'].add(1, 2);
        expect(sum).to.equal(3);
    });


    it('should load function services', function() {
        expect(mycro.services['error']).to.be.an('object');
        expect(mycro.services['error'].notify).to.be.a('function');
    });


    it('should load non-first level services at the appropriate path', function() {
        expect(mycro.services['format/date']).to.be.an('object');
        expect(mycro.services['format/date'].format).to.be.a('function');
        expect(mycro.services['format/number']).to.be.an('object');
        expect(mycro.services['format/number'].format).to.be.a('function');
    });


    it('should enable services to utilize other services', function(done) {
        sinon.spy(mycro.services['error'], 'notify');
        mycro.services['format/date'].format('gibberish', 'YYYY MM DD', function(err) {
            expect(err).to.exist;
            expect(mycro.services['error'].notify).to.have.been.calledWith('Invalid date');
            done();
        });
    });
});
