/* jshint expr:true */
'use strict';

var asyncjs = require('async'),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect;

describe('[hook] services', function() {
    it('should load services at microservice.services', function() {
        expect(microservice.services).to.exist;
        expect(microservice.services['simple']).to.exist;
    });

    it('should load object services', function(done) {
        asyncjs.parallel({
            add: function(fn) {
                microservice.services['simple'].add(1, 2, function(err, sum) {
                    expect(err).to.not.exist;
                    expect(sum).to.equal(3);
                    fn(err);
                });
            },
            subtract: function(fn) {
                microservice.services['simple'].subtract(3, 2, function(err, difference) {
                    expect(err).to.not.exist;
                    expect(difference).to.equal(1);
                    fn(err);
                });
            }
        }, done);
    });

    it('should load function services', function() {
        expect(microservice.services).to.exist;
        expect(microservice.services['complex']).to.exist;
        expect(microservice.services['complex']).to.be.an('object');
    });

    it('should enable services to utilize other services', function(done) {
        sinon.spy(microservice.services['simple'], 'subtract');
        microservice.services['complex'].reverseSubtract(2, 3, function(err, difference) {
            expect(err).to.not.exist;
            expect(difference).to.equal(1);
            expect(microservice.services['simple'].subtract).to.have.been.called;
            microservice.services['simple'].subtract.restore();
            done(err);
        });
    });
});
