/* jshint expr:true */
'use strict';

var expect = require('chai').expect,
    Microservice = require('../../index'),
    sinon = require('sinon'),
    _ = require('lodash');

describe('[hook] models', function() {
    var adapter;

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
    });

    it('should not return an error if no models are defined', function(done) {
        var cwd = process.cwd();
        process.chdir(__dirname + '/models/test-app-no-models');

        var _microservice = new Microservice({
            connections: {
                test: {
                    adapter: adapter,
                    config: {}
                }
            }
        });

        _microservice.start(function(err) {
            process.chdir(cwd);
            expect(err).to.not.exist;
            done();
        });
    });


    it('should return an error if no adapter (explicit or default) can be found for at least one model', function(done) {
        var cwd = process.cwd();
        process.chdir(__dirname + '/models/test-app-missing-adapter');

        var _microservice = new Microservice({
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

        _microservice.start(function(err) {
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

        var _microservice = new Microservice({
            connections: {
                one: {
                    adapter: invalidAdapter,
                    config: {}
                }
            }
        });

        _microservice.start(function(err) {
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

        var _microservice = new Microservice({
            connections: {
                one: {
                    adapter: invalidAdapter,
                    config: {}
                }
            }
        });

        _microservice.start(function(err) {
            process.chdir(cwd);
            expect(err).to.exist;
            done();
        });
    });


    it('should return an error if the adapter\'s `registerModel` method returns an error', function(done) {
        var cwd = process.cwd();
        process.chdir(__dirname + '/models/test-app-missing-adapter');

        sinon.stub(adapter, 'registerModel').callsArgWithAsync(2, new Error('Something unexpected'));

        var _microservice = new Microservice({
            connections: {
                one: {
                    adapter: adapter,
                    config: {}
                }
            }
        });

        _microservice.start(function(err) {
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

        var _microservice = new Microservice({
            connections: {
                one: {
                    adapter: adapter,
                    config: {}
                }
            }
        });

        _microservice.start(function(err) {
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

        var _microservice = new Microservice({
            connections: {
                one: {
                    adapter: adapter,
                    config: {}
                }
            }
        });

        _microservice.start(function(err) {
            process.chdir(cwd);
            adapter.processModels.restore();
            expect(err).to.exist;
            done();
        });
    });
});
