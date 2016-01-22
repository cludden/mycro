'use strict';

var expect = require('chai').expect,
    sinon = require('sinon'),
    supertest = require('supertest');

describe('POST /api/login', function() {
    var request;

    before(function() {
        request = supertest.agent(mycro.server);
    });


    it('should allow a route to reset the policy chain', function(done) {
        request.post('/api/login')
            .expect(200)
            .end(done);
    });


    it('should contain options from up the chain', function(done) {
        sinon.spy(mycro, 'log');
        request.post('/api/login')
            .expect(200)
            .end(function(err) {
                expect(mycro.log.lastCall.args[2]).to.eql({desc: 'welcome to the api v1.0.0'});
                mycro.log.restore();
                done(err);
            });
    });
});
