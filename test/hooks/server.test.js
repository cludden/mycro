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


    context('middleware', function() {
        var request;

        before(function() {
            request = require('supertest').agent(microservice.server);
        });

        it('should load acceptParser', function(done) {
            request.get('/healthy')
                .set('Accept-Version', '~1.0.0')
                .set('Accept', 'randomStuffHere')
                .expect(406)
                .end(done);
        });


        it('should load queryParser', function(done) {
            request.get('/api/test/query?test=true')
                .set('Accept-Version', '~1.0.0')
                .expect(200)
                .expect(function(res) {
                    expect(res.body.query.test).to.equal('true');
                })
                .end(done);
        });


        it('should load bodyParser', function(done) {
            request.post('/api/test/body')
                .set('Accept-Version', '~1.0.0')
                .send({
                    a: 1,
                    b: 2,
                    c: 3
                })
                .expect(200)
                .expect(function(res) {
                    expect(res.body.params).to.eql({
                        a: 1,
                        b: 2,
                        c: 3
                    });
                })
                .end(done);
        });


        it('should load request and request all', function(done) {
            request.post('/api/test/all?a=yes')
                .set('Accept-Version', '~1.0.0')
                .send({
                    b: 'no'
                })
                .expect(200)
                .expect(function(res) {
                    expect(res.body.all).to.eql({
                        a: 'yes',
                        b: 'no'
                    });
                })
                .end(done);
        });
    });

    context('coverage tests', function() {
        it('should not throw an error if a non-string or function middleware is provided', function(done) {
            var originalDir = process.cwd();
            process.chdir(__dirname + '/../test-app-2');

            var Microservice = require('../../index'),
                m = new Microservice({
                    server: {
                        port: 'abc',
                        middleware: [
                            1,
                            {}
                        ]
                    },
                    hooks: [
                        'server',
                        'routes'
                    ]
                });

            m.start(function(err) {
                expect(err).to.not.exist;
                process.chdir(originalDir);
                done();
            });
        });


        it('should not throw an error if string middleware can\'t be found', function(done) {
            var originalDir = process.cwd();
            process.chdir(__dirname + '/../test-app-2');

            var Microservice = require('../../index'),
                m = new Microservice({
                    server: {
                        port: 'abc',
                        middleware: [
                            'test'
                        ]
                    },
                    hooks: [
                        'server',
                        'routes'
                    ]
                });

            m.start(function(err) {
                expect(err).to.not.exist;
                process.chdir(originalDir);
                done();
            });
        });
    });
});
