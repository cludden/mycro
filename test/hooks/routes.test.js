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

    describe('handlers', function() {

        it('should support string notation for policies', function(done) {
            asyncjs.series({
                unauthenticatedGet: function(fn) {
                    request.get('/api/greet/aloha/chris')
                        .set('Accept-Version', '~1.0.0')
                        .expect(403)
                        .expect(function(res) {
                            expect(res.headers['x-default-middleware']).to.not.exist;
                        })
                        .end(fn);
                },
                authenticatedGet: function(fn) {
                    request.get('/api/greet/aloha/chris')
                        .set('Accept-Version', '~1.0.0')
                        .set('Authorization', 'Bearer abc')
                        .expect(200)
                        .expect(function(res) {
                            expect(res.headers['x-default-middleware']).to.not.exist;
                        })
                        .end(fn);
                },
                unauthenticatedPost: function(fn) {
                    request.post('/api/greet/aloha/chris')
                        .set('Accept-Version', '~1.0.0')
                        .expect(403)
                        .expect(function(res) {
                            expect(res.headers['x-default-middleware']).to.not.exist;
                        })
                        .end(fn);
                },
                authenticatedPost: function(fn) {
                    request.post('/api/greet/aloha/chris')
                        .set('Accept-Version', '~1.0.0')
                        .set('Authorization', 'Bearer abc')
                        .expect(200)
                        .expect(function(res) {
                            expect(res.headers['x-default-middleware']).to.not.exist;
                        })
                        .end(fn);
                }
            }, done);
        });


        it('should support string notation for controllers', function(done) {
            asyncjs.series({
                reset: function(fn) {
                    request.del('/api/count')
                        .set('Accept-Version', '~1.0.0')
                        .expect(200)
                        .expect(function(res) {
                            expect(res.body.count).to.equal(0);
                        })
                        .end(fn);
                },
                post: function(fn) {
                    request.post('/api/count')
                        .set('Accept-Version', '~1.0.0')
                        .expect(200)
                        .expect(function(res) {
                            expect(res.body.count).to.equal(1);
                        })
                        .end(fn);
                },
                get: function(fn) {
                    request.get('/api/count')
                        .set('Accept-Version', '~1.0.0')
                        .expect(200)
                        .expect(function(res) {
                            expect(res.body.count).to.equal(1);
                        })
                        .end(fn);
                }
            }, done);
        });


        it('should support object notation for policies', function(done) {
            asyncjs.parallel({
                unauthenticated: function(fn) {
                    request.put('/api/count')
                        .set('Accept-Version', '~1.0.0')
                        .expect(403)
                        .end(fn);
                },
                authenticated: function(fn) {
                    request.put('/api/count')
                        .set('Accept-Version', '~1.0.0')
                        .set('Authorization', 'Bearer abc')
                        .expect(200)
                        .end(fn);
                }
            }, done);
        });


        it('should support object notation for controllers', function(done) {
            asyncjs.series({
                reset: function(fn) {
                    request.del('/api/count')
                        .set('Accept-Version', '~1.0.0')
                        .expect(200)
                        .expect(function(res) {
                            expect(res.body.count).to.equal(0);
                        })
                        .end(fn);
                },
                post: function(fn) {
                    request.post('/api/count')
                        .set('Accept-Version', '~1.0.0')
                        .expect(200)
                        .expect(function(res) {
                            expect(res.body.count).to.equal(1);
                        })
                        .end(fn);
                }
            }, done);
        });


        it('should support functions', function(done) {
            request.del('/api/count')
                .set('Accept-Version', '~2.0.0')
                .expect(200)
                .expect(function(res) {
                    expect(res.headers['x-test-header']).to.equal('true');
                    expect(res.body.message).to.equal('boo');
                })
                .end(done);
        });
    });


    describe('middleware', function() {

        it('should apply the default middleware to first-level routes', function(done) {
            request.get('/api/greet/hello/chris')
                .set('Accept-Version', '~1.0.0')
                .expect(200)
                .expect(function(res) {
                    expect(res.headers['x-default-middleware']).to.equal('true');
                })
                .end(done);
        });


        it('should apply inline default middleware to first-level routes', function(done) {
            sinon.spy(microservice, 'log');
            request.get('/api/greet/hello/chris')
                .set('Accept-Version', '~1.0.0')
                .expect(200)
                .end(function(err) {
                    expect(microservice.log).to.have.been.calledWith('silly', 'inline default middleware');
                    microservice.log.restore();
                    done();
                });
        });

        it('should allow tagged versions to provide their own default middleware', function(done) {
            request.get('/api/count')
                .set('Accept-Version', '~2.0.0')
                .expect(200)
                .expect(function(res) {
                    expect(res.headers['x-default-middleware']).to.not.exist;
                    expect(res.headers['x-app-version']).to.equal('2.0.0');
                })
                .end(done);
        });

        it('should allow paths to override the default middleware', function(done) {
            asyncjs.series({
                unauthenticatedGet: function(fn) {
                    request.get('/api/greet/aloha/chris')
                        .set('Accept-Version', '~1.0.0')
                        .expect(403)
                        .expect(function(res) {
                            expect(res.headers['x-default-middleware']).to.not.exist;
                        })
                        .end(fn);
                },
                authenticatedGet: function(fn) {
                    request.get('/api/greet/aloha/chris')
                        .set('Accept-Version', '~1.0.0')
                        .set('Authorization', 'Bearer abc')
                        .expect(200)
                        .expect(function(res) {
                            expect(res.headers['x-default-middleware']).to.not.exist;
                        })
                        .end(fn);
                },
                unauthenticatedPost: function(fn) {
                    request.post('/api/greet/aloha/chris')
                        .set('Accept-Version', '~1.0.0')
                        .expect(403)
                        .expect(function(res) {
                            expect(res.headers['x-default-middleware']).to.not.exist;
                        })
                        .end(fn);
                },
                authenticatedPost: function(fn) {
                    request.post('/api/greet/aloha/chris')
                        .set('Accept-Version', '~1.0.0')
                        .set('Authorization', 'Bearer abc')
                        .expect(200)
                        .expect(function(res) {
                            expect(res.headers['x-default-middleware']).to.not.exist;
                        })
                        .end(fn);
                }
            }, done);
        });


        it('should allow individual routes (method + path + version) to override the default middleware', function(done) {
            asyncjs.parallel({
                default: function(fn) {
                    request.get('/api/count')
                        .set('Accept-Version', '~1.0.0')
                        .expect(200)
                        .expect(function(res) {
                            expect(res.headers['x-default-middleware']).to.equal('true');
                        })
                        .end(fn);
                },

                overridden: function(fn) {
                    request.post('/api/count')
                        .set('Accept-Version', '~1.0.0')
                        .expect(200)
                        .expect(function(res) {
                            expect(res.headers['x-default-middleware']).to.not.exist;
                        })
                        .end(fn);
                }
            }, done);
        });
    });


    describe('versioning', function() {

        it('should load first-level routes with the default version', function(done) {
            asyncjs.parallel({
                'v1.0.0': function(fn) {
                    request.get('/api/greet/hello/chris')
                        .set('Accept-Version', '~1.0.0')
                        .expect(200)
                        .expect(function(res) {
                            expect(res.body.message).to.equal('Hello, chris!');
                        })
                        .end(function(err, res) {
                            fn(err);
                        });
                },

                'v3.0.0': function(fn) {
                    request.get('/api/greet/hello/chris')
                        .set('Accept-Version', '~3.0.0')
                        .expect(400)
                        .end(fn);
                }
            }, done);
        });


        it('should load tagged routes with the specified version', function(done) {
            request.get('/api/greet/hello/chris')
                .set('Accept-Version', '~2.0.0')
                .set('Authorization', 'Bearer abc')
                .expect(200)
                .end(done);
        });
    });
});
