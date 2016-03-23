/* jshint expr:true */
'use strict';

var expect = require('chai').expect,
    Mycro = require('../../index'),
    sinon = require('sinon'),
    _ = require('lodash');

describe('[hook] models', function() {
    var adapter, adapter2, adapter3;

    before(function() {
        adapter = {
            processModels: function(models, definitions, cb) {
                setTimeout(function() {
                    return cb();
                }, 10);
            },

            registerConnection: function(config, cb) {
                var models = [];
                setTimeout(function() {
                    cb(null, {
                        modelNames: function() {
                            return models.slice();
                        },
                        define: function(name, schema) {
                            models.push(name);
                            return {
                                schema: schema
                            };
                        }
                    });
                }, 20);
            },
            registerModel: function(connection, definition, cb) {
                try {
                    var model = definition(connection);
                    return cb(null, model);
                } catch (e) {
                    return cb(e);
                }
            }
        };
        adapter2 = _.extend(_.cloneDeep(adapter), {
            registerModel: function(connection, definition, name, cb) {
                try {
                    var model = definition(connection);
                    return cb(null, model);
                } catch (e) {
                    return cb(e);
                }
            }
        });
        adapter3 = _.extend(_.cloneDeep(adapter), {
            registerModel: function(connection, definition, name, mycro, cb) {
                try {
                    var model = definition(connection);
                    return cb(null, model);
                } catch (e) {
                    return cb(e);
                }
            }
        });
    });

    it('should not return an error if no models are defined', function(done) {
        var cwd = process.cwd();
        process.chdir(__dirname + '/models/test-app-no-models');

        var _mycro = new Mycro({
            connections: {
                test: {
                    adapter: adapter,
                    config: {}
                }
            }
        });

        _mycro.start(function(err) {
            process.chdir(cwd);
            expect(err).to.not.exist;
            done();
        });
    });


    it('should return an error if no adapter (explicit or default) can be found for at least one model', function(done) {
        var cwd = process.cwd();
        process.chdir(__dirname + '/models/test-app-missing-adapter');

        var _mycro = new Mycro({
            connections: {
                one: {
                    adapter: adapter,
                    config: {},
                    models: [
                        'one/*'
                    ]
                },
                two: {
                    adapter: adapter,
                    config: {},
                    models: [
                        'two/*'
                    ]
                }
            }
        });

        _mycro.start(function(err) {
            process.chdir(cwd);
            expect(err).to.exist;
            done();
        });
    });


    it('should return an error if the adapter does not define a `registerModel` method', function(done) {
        var cwd = process.cwd();
        process.chdir(__dirname + '/models/test-app-missing-adapter');

        var invalidAdapter = _.clone(adapter);
        delete invalidAdapter.registerModel;

        var _mycro = new Mycro({
            connections: {
                one: {
                    adapter: invalidAdapter,
                    config: {}
                }
            }
        });

        _mycro.start(function(err) {
            process.chdir(cwd);
            expect(err).to.exist;
            done();
        });
    });


    it('should return an error if the adapter\'s `registerModel` method does not expect 3 arguments', function(done) {
        var cwd = process.cwd();
        process.chdir(__dirname + '/models/test-app-missing-adapter');

        var invalidAdapter = _.clone(adapter);
        invalidAdapter.registerModel = function() {};

        var _mycro = new Mycro({
            connections: {
                one: {
                    adapter: invalidAdapter,
                    config: {}
                }
            }
        });

        _mycro.start(function(err) {
            process.chdir(cwd);
            expect(err).to.exist;
            done();
        });
    });


    it('should return an error if the adapter\'s `registerModel` method returns an error', function(done) {
        var cwd = process.cwd();
        process.chdir(__dirname + '/models/test-app-missing-adapter');

        sinon.stub(adapter, 'registerModel').callsArgWithAsync(2, new Error('Something unexpected'));

        var _mycro = new Mycro({
            connections: {
                one: {
                    adapter: adapter,
                    config: {}
                }
            }
        });

        _mycro.start(function(err) {
            process.chdir(cwd);
            adapter.registerModel.restore();
            expect(err).to.exist;
            done();
        });
    });


    it('should return an error if the adapter\'s `registerModel` method does not return a model', function(done) {
        var cwd = process.cwd();
        process.chdir(__dirname + '/models/test-app-missing-adapter');

        sinon.stub(adapter, 'registerModel').callsArgWithAsync(2);

        var _mycro = new Mycro({
            connections: {
                one: {
                    adapter: adapter,
                    config: {}
                }
            }
        });

        _mycro.start(function(err) {
            process.chdir(cwd);
            adapter.registerModel.restore();
            expect(err).to.exist;
            done();
        });
    });


    it('should return an error if the adapter\'s `processModels` method returns an error', function(done) {
        var cwd = process.cwd();
        process.chdir(__dirname + '/models/test-app-missing-adapter');

        sinon.stub(adapter, 'processModels').yieldsAsync(new Error('Something unexpected'));

        var _mycro = new Mycro({
            connections: {
                one: {
                    adapter: adapter,
                    config: {}
                }
            }
        });

        _mycro.start(function(err) {
            process.chdir(cwd);
            adapter.processModels.restore();
            expect(err).to.exist;
            done();
        });
    });

    it('should allow adapters\' `registerModel` hook to accept an optional name argument', function(done) {
        var cwd = process.cwd();
        process.chdir(__dirname + '/models/test-app-missing-adapter');

        var _mycro = new Mycro({
            connections: {
                one: {
                    adapter: adapter2,
                    config: {}
                }
            }
        });

        _mycro.start(function(err) {
            process.chdir(cwd);
            expect(err).to.not.exist;
            done();
        });
    });

    it('should allow adapters\' `registerModel` hook to accept an optional name and mycro argument', function(done) {
        var cwd = process.cwd();
        process.chdir(__dirname + '/models/test-app-missing-adapter');

        var _mycro = new Mycro({
            connections: {
                one: {
                    adapter: adapter3,
                    config: {}
                }
            }
        });

        _mycro.start(function(err) {
            process.chdir(cwd);
            expect(err).to.not.exist;
            done();
        });
    });
});
