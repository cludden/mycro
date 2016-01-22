'use strict';

var asyncjs = require('async'),
    supertest = require('supertest');

describe('GET /api/admin/config', function() {
    var request;

    before(function() {
        request = supertest.agent(mycro.server);
    });

    it('should allow routes to be included from included files', function(done) {
        asyncjs.parallel({
            admin: function(fn) {
                request.get('/api/admin/config')
                    .set('x-user-id', 1)
                    .expect(200)
                    .end(fn);
            },
            nonAdmin: function(fn) {
                request.get('/api/admin/config')
                    .set('x-user-id', 2)
                    .expect(403)
                    .end(fn);
            }
        }, done);
    });
});
