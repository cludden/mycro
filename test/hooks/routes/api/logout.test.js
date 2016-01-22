'use strict';

var expect = require('chai').expect,
    supertest = require('supertest');

describe('GET /api/logout', function() {
    var request;

    before(function() {
        request = supertest.agent(mycro.server);
    });


    it('should apply the `authenticated` policy assigned at the /api level', function(done) {
        request.get('/api/logout')
            .expect(401)
            .end(done);
    });

    it('should map the string handler `auth.logout` to /app/controllers/auth.js#logout', function(done) {
        request.get('/api/logout')
            .set('x-user-id', 1)
            .expect(200)
            .expect(function(res) {
                expect(res.body.message).to.equal('logout successful!');
            })
            .end(done);
    });
});
