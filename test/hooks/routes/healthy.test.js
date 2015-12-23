'use strict';

var expect = require('chai').expect,
    supertest = require('supertest');

describe('GET /healthy', function() {
    var request;

    before(function() {
        request = supertest.agent(microservice.server);
    });

    it('should default to the latest version if no `Accept-Version` header is provided', function(done) {
        request.get('/healthy')
            .expect(200)
            .expect(function(res) {
                expect(res.body).to.eql({});
            })
            .end(done);
    });

    it('should respond with v2.0.0 when specified', function(done) {
        request.get('/healthy')
            .expect(200)
            .expect(function(res) {
                expect(res.body.status).to.equal('healthy');
            })
            .end(done);
    });


    it('should respond with v1.0.0 when specified');
});
