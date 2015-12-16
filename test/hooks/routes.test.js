/* jshint expr:true */
'use strict';

var chai = require('chai'),
    asyncjs = require('async'),
    sinon = require('sinon'),
    expect = chai.expect;

describe('[hook] routes', function() {
    var request;

    before(function() {
        request = require('supertest').agent(microservice.server);
    });

    it('should load first-level routes with the default version', function(done) {
        asyncjs.parallel({
            'v1.0.0': function(fn) {
                request.get('/api/greet/hello/chris')
                    .set('Accept-Version', 'v1.0.0')
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body.message).to.equal('Hello, chris!');
                    })
                    .end(function(err, res) {
                        console.log(res);
                        fn(err);
                    });
            },

            'v2.0.0': function(fn) {
                request.get('/api/greet/hello/chris')
                    .set('Accept-Version', 'v2.0.0')
                    .expect(400)
                    .end(fn);
            }
        }, done);
    });

    it('should apply the default middleware to first-level routes', function(done) {
        sinon.spy(microservice.policies, 'default');
        request.get('/api/greet/hello/chris')
            .expect(200)
            .end(function(err) {
                expect(microservice.policies.default).to.have.been.called;
                microservice.policies.default.restore();
                done();
            });
    });

    it('should apply inline default middleware to first-level routes', function(done) {
        sinon.spy(microservice, 'log');
        request.get('/api/greet/hello/chris')
            .expect(200)
            .end(function(err) {
                expect(microservice.log).to.have.been.calledWith('trace', 'inline default middleware');
                microservice.log.restore();
                done();
            });
    });
});
