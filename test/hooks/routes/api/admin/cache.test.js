'use strict';

var expect = require('chai').expect,
    supertest = require('supertest');

describe('GET /api/admin/cache/clear', function() {
    var request;

    before(function() {
        request = supertest.agent(mycro.server);
    });


    it('should apply the existing policy chain to included routes if not overridden', function(done) {
        request.post('/api/admin/cache/clear')
            .expect(401)
            .end(done);
    });


    it('should allow additional policies to be added to the current policy chain at a sub-path', function(done) {
        request.post('/api/admin/cache/clear')
            .set('x-user-id', 2)
            .expect(403)
            .expect(function(res) {
                expect(res.body.error).to.equal('user is not a member of group (admins)');
            })
            .end(done);
    });


    it('should allow a policy factory to be added to the current policy chain and handle nested policies', function(done) {
        request.post('/api/admin/cache/clear')
            .set('x-user-id', 1)
            .send({path: 'user:*'})
            .expect(200)
            .end(function(err) {
                done();
            });
    });
});
