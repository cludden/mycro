/* jshint expr:true */
'use strict';

var asyncjs = require('async'),
    expect = require('chai').expect,
    Mycro = require('../../index'),
    sinon = require('sinon'),
    supertest = require('supertest'),
    _ = require('lodash');

describe('[hook] routes', function() {
    var request;

    before(function() {
        request = supertest.agent(mycro.server);
    });


    it('should return successfully with no errors', function(done) {
        var cwd = process.cwd();
        process.chdir(__dirname + '/routes/test-app-no-problems');

        var _mycro = new Mycro({});

        _mycro.start(function(err) {
            process.chdir(cwd);
            expect(err).to.not.exist;
            done();
        });
    });


    it('should return an error if no `/app/routes.js` file is defined', function(done) {
        var cwd = process.cwd();
        process.chdir(__dirname + '/routes/test-app-no-routes');

        var _mycro = new Mycro({});

        _mycro.start(function(err) {
            process.chdir(cwd);
            expect(err).to.exist;
            done();
        });
    });


    it('should allow multiple versions to be defined', function(done) {
        asyncjs.parallel([
            function noVersionSpecified(fn) {
                request.get('/healthy')
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body).to.eql({status: 'healthy'});
                    })
                    .end(fn);
            },

            function v1(fn) {
                request.get('/healthy')
                    .set('Accept-Version', '~1.0.0')
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body).to.eql({});
                    })
                    .end(fn);
            },

            function v2(fn) {
                request.get('/healthy')
                    .set('Accept-Version', '~2.0.0')
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body.status).to.equal('healthy');
                    })
                    .end(fn);
            }
        ], done);
    });


    it('should allow `req.options` to be defined and extended at multiple levels', function(done) {
        asyncjs.parallel([
            function depth1(fn) {
                request.get('/api/test/options/l1')
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body.options).to.eql({
                            desc: '/api/test/options',
                            depth1: 'a'
                        });
                    })
                    .end(fn);
            },

            function depth2(fn) {
                request.get('/api/test/options/l1/l2')
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body.options).to.eql({
                            desc: '/api/test/options',
                            depth1: 'a',
                            depth2: 'b'
                        });
                    })
                    .end(fn);
            }
        ], done);
    });


    it('should allow policies to be defined at path, subpath, and route levels', function(done) {
        asyncjs.parallel([
            function path(fn) {
                asyncjs.parallel([
                    function error(_fn) {
                        request.get('/api/logout')
                            .expect(401)
                            .end(_fn);
                    },

                    function success(_fn) {
                        request.get('/api/logout')
                            .set('x-user-id', 1)
                            .expect(200)
                            .expect(function(res) {
                                expect(res.body.message).to.equal('logout successful!');
                            })
                            .end(_fn);
                    }
                ], fn);
            },

            function subpath(fn) {
                request.get('/api/public/logout')
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body.message).to.equal('logout successful!');
                    })
                    .end(fn);
            },

            function route(fn) {
                asyncjs.parallel([
                    function noOverrides(_fn) {
                        request.get('/api/login')
                            .expect(401)
                            .end(_fn);
                    },

                    function overrides(_fn) {
                        request.post('/api/login')
                            .expect(200)
                            .expect(function(res) {
                                expect(res.body.message).to.equal('login successful!');
                            })
                            .end(_fn);
                    }
                ], fn);
            }
        ], done);
    });


    it('should allow policies to be added to the policy chain at subpaths and routes', function(done) {
        asyncjs.parallel({
            subpathError: function(fn) {
                request.get('/api/groups')
                    .set('x-user-id', 2)
                    .expect(403)
                    .end(fn);
            },

            subpathSuccess: function(fn) {
                request.get('/api/groups')
                    .set('x-user-id', 1)
                    .expect(200)
                    .end(fn);
            },

            routeError: function(fn) {
                request.get('/api/users/1')
                    .set('x-user-id', 3)
                    .expect(403)
                    .end(fn);
            },

            routeSuccessIsEqual: function(fn) {
                request.get('/api/users/2')
                    .set('x-user-id', 2)
                    .expect(200)
                    .end(fn);
            },

            routeSuccessAbleTo: function(fn) {
                request.get('/api/users/2')
                    .set('x-user-id', 1)
                    .expect(200)
                    .end(fn);
            }
        }, done);
    });


    it('should allow function handlers at all levels', function(done) {
        asyncjs.parallel([
            function(fn) {
                request.get('/healthy')
                    .set('accept-version', '1.0.0')
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body).to.eql({});
                    })
                    .end(fn);
            },

            function(fn) {
                request.get('/api/test/options')
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body.options).to.eql({
                            desc: '/api/test/options'
                        });
                    })
                    .end(fn);
            }
        ], done);
    });


    it('should allow function policies', function(done) {
        asyncjs.parallel([
            function(fn) {
                request.get('/api/users/1')
                    .set('x-user-id', 2)
                    .expect(403)
                    .end(fn);
            },
            function(fn) {
                request.get('/api/users/2')
                    .set('x-user-id', 1)
                    .expect(200)
                    .end(fn);
            },
            function(fn) {
                request.get('/api/users/3')
                    .set('x-user-id', 3)
                    .expect(200)
                    .end(fn);
            }
        ], done);
    });


    it('should allow multiple levels of function policies', function(done) {
        asyncjs.parallel([
            function(fn) {
                request.put('/api/users/1')
                    .expect(401)
                    .end(fn);
            },
            function(fn) {
                request.put('/api/users/1')
                    .set('x-user-id', 2)
                    .expect(403)
                    .end(fn);
            },
            function(fn) {
                request.put('/api/users/2')
                    .set('x-user-id', 2)
                    .expect(200)
                    .expect(function(res) {
                        expect(res.headers['x-blacklist']).to.equal('id,email,last,mobile');
                    })
                    .end(fn);
            },
            function(fn) {
                request.put('/api/users/2')
                    .set('x-user-id', 1)
                    .expect(200)
                    .expect(function(res) {
                        expect(res.headers['x-blacklist']).to.equal('id');
                    })
                    .end(fn);
            }
        ], done);
    });


    it('should allow routes to be included at a subpath via string', function(done) {
        request.get('/api/admin/test')
            .expect(200)
            .expect(function(res) {
                expect(res.body.message).to.equal('ok');
            })
            .end(done);
    });


    it('should allow routes to be included at a subpath via a `routes` attribute', function(done) {
        asyncjs.parallel([
            function(fn) {
                request.get('/api/groups')
                    .set('x-user-id', 1)
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body).to.have.lengthOf(2);
                    })
                    .end(fn);
            },

            function(fn) {
                request.get('/api/groups/1')
                    .set('x-user-id', 1)
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body.id).to.equal(1);
                    })
                    .end(fn);
            }
        ], done);
    });


    it('should allow regex routes at various levels', function(done) {
        asyncjs.parallel([
            function(fn) {
                request.get('/api/say/hello/chris')
                    .set('x-user-id', 1)
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body.message).to.equal('Hello chris!');
                    })
                    .end(fn);
            },

            function(fn) {
                request.get('/api/say/hello/chris/test')
                    .set('x-user-id', 1)
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body.message).to.equal('test successful');
                    })
                    .end(fn);
            },

            function(fn) {
                request.get('/api/say/hello/chris/test/123')
                    .set('x-user-id', 1)
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body.message).to.equal('123');
                    })
                    .end(fn);
            },

            function(fn) {
                request.get('/api/say/hello/chris/test/abc')
                    .set('x-user-id', 1)
                    .expect(404)
                    .end(fn);
            }
        ], done);
    });


    it('should allow included routes to be reused', function(done) {
        asyncjs.series([
            function(fn) {
                sinon.spy(mycro.services['data'], 'find');
                request.get('/api/groups')
                    .set('x-user-id', 1)
                    .expect(200)
                    .end(function(err) {
                        expect(mycro.services['data'].find).to.have.been.called;
                        mycro.services['data'].find.restore();
                        fn(err);
                    });
            },

            function(fn) {
                sinon.spy(mycro.services['data'], 'find');
                request.get('/api/users')
                    .set('x-user-id', 1)
                    .expect(200)
                    .end(function(err) {
                        expect(mycro.services['data'].find).to.have.been.called;
                        mycro.services['data'].find.restore();
                        fn(err);
                    });
            }
        ], done);
    });


    it('should look for an `index` method if no `actionName` is specified', function(done) {
        asyncjs.parallel([
            function(fn) {
                request.get('/api/say')
                    .set('x-user-id', 1)
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body).to.have.property('message', 'Hello from the index method!');
                    })
                    .end(fn);
            },

            function(fn) {
                request.get('/api/blog')
                    .set('x-user-id', 1)
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body).to.have.property('message', 'Hello from blog/posts.index!');
                    })
                    .end(fn);
            }
        ], done);
    });


    context('coverage tests', function() {
        it('should return an error if an invalid route definition is defined', function(done) {
            var cwd = process.cwd();
            process.chdir(__dirname + '/routes/test-app-invalid-definition');

            var _mycro = new Mycro();
            _mycro.start(function(err) {
                process.chdir(cwd);
                expect(err).to.exist;
                done();
            });
        });


        it('should return an error if a handler is not a valid type', function(done) {
            var cwd = process.cwd();
            process.chdir(__dirname + '/routes/test-app-invalid-handler-type');

            var _mycro = new Mycro({
                hooks: ['server', 'routes']
            });

            _mycro.start(function(err) {
                process.chdir(cwd);
                expect(err).to.exist;
                done();
            });
        });


        it('should return an error if an object type handler is defined with no `handler` attribute', function(done) {
            var cwd = process.cwd();
            process.chdir(__dirname + '/routes/test-app-no-handler');

            var _mycro = new Mycro({
                hooks: ['server', 'routes']
            });

            _mycro.start(function(err) {
                process.chdir(cwd);
                expect(err).to.exist;
                done();
            });
        });


        it('should return an error if an object handler is defined with an invalid type `handler` attribute', function(done) {
            var cwd = process.cwd();
            process.chdir(__dirname + '/routes/test-app-nested-invalid-handler');

            var _mycro = new Mycro({
                server: {
                    port: 8081
                },
                hooks: ['server', 'routes']
            });

            _mycro.start(function(err) {
                process.chdir(cwd);
                expect(err).to.exist;
                done();
            });
        });


        it('should return an error if a string type policy is specified but not defined', function(done) {
            var cwd = process.cwd();
            process.chdir(__dirname + '/routes/test-app-missing-policy');

            var _mycro = new Mycro({
                server: {
                    port: 8081
                },
                hooks: ['server', 'policies', 'routes']
            });

            _mycro.start(function(err) {
                process.chdir(cwd);
                expect(err).to.exist;
                done();
            });
        });


        it('should return an error if there is an error while attempting to bind the route', function(done) {
            var cwd = process.cwd();
            process.chdir(__dirname + '/routes/test-app-no-problems');

            var _mycro = new Mycro({
                server: {
                    port: 8081
                },
                hooks: [
                    'server',
                    function(cb) {
                        sinon.stub(_mycro.server, 'get').throws();
                        cb();
                    },
                    'routes'
                ]
            });

            _mycro.start(function(err) {
                process.chdir(cwd);
                _mycro.server.get.restore();
                expect(err).to.exist;
                done();
            });
        });


        it('should return an error if a string handler is defined without both a controller and an action', function(done) {
            var cwd = process.cwd();
            process.chdir(__dirname + '/routes/test-app-invalid-string-handler');

            var _mycro = new Mycro({
                server: {
                    port: 8081
                },
                hooks: ['server', 'controllers', 'routes']
            });

            _mycro.start(function(err) {
                process.chdir(cwd);
                expect(err).to.exist;
                done();
            });
        });


        it('should return an error if the handler\'s controller cannot be found', function(done) {
            var cwd = process.cwd();
            process.chdir(__dirname + '/routes/test-app-missing-controller');

            var _mycro = new Mycro({
                server: {
                    port: 8081
                },
                hooks: ['server', 'controllers', 'routes']
            });

            _mycro.start(function(err) {
                process.chdir(cwd);
                expect(err).to.exist;
                done();
            });
        });


        it('should return an error if the handler\'s action cannot be found on the specified controller', function(done) {
            var cwd = process.cwd();
            process.chdir(__dirname + '/routes/test-app-missing-action');

            var _mycro = new Mycro({
                server: {
                    port: 8081
                },
                hooks: ['server', 'controllers', 'routes']
            });

            _mycro.start(function(err) {
                process.chdir(cwd);
                expect(err).to.exist;
                done();
            });
        });


        it('should return an error if the handler\'s action is not a function', function(done) {
            var cwd = process.cwd();
            process.chdir(__dirname + '/routes/test-app-invalid-action-type');

            var _mycro = new Mycro({
                server: {
                    port: 8081
                },
                hooks: ['server', 'controllers', 'routes']
            });

            _mycro.start(function(err) {
                process.chdir(cwd);
                expect(err).to.exist;
                done();
            });
        });

        it('should support PATCH requests', function(done) {
            var cwd = process.cwd();
            process.chdir(__dirname + '/routes/test-app-patch');

            var _mycro = new Mycro({
                server: {
                    port: 8081
                },
                hooks: ['server', 'controllers', 'routes']
            });

            asyncjs.waterfall([
                function(fn) {
                    _mycro.start(function(err) {
                        process.chdir(cwd);
                        var e = _.attempt(function() {
                            expect(err).to.not.exist;
                        });
                        fn(e);
                    });
                },

                function(fn) {
                    var req = supertest.agent(_mycro.server);
                    req.patch('/test')
                    .expect(200)
                    .end(fn);
                }
            ], done);
        });
    });
});
