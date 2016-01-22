/* jshint expr:true */
'use strict';

var expect = require('chai').expect,
    sinon = require('sinon');

describe('[hook] connections', function() {
    it('should not return an error if no connections are defined', function(done) {
        var Mycro = require('../../index'),
            _mycro = new Mycro({
                connections: {},
                hooks: ['connections']
            });

        _mycro.start(function(err) {
            expect(err).to.not.exist;
            done();
        });
    });


    it('should return an error if no adapter is specified', function(done) {
        var Mycro = require('../../index'),
            _mycro = new Mycro({
                connections: {
                    test: {
                        config: {}
                    }
                },
                hooks: ['connections']
            });

        _mycro.start(function(err) {
            expect(err).to.exist;
            done();
        });
    });


    it('should return an error if the adapter does not define a `registerConnection` method', function(done) {
        var Mycro = require('../../index'),
            _mycro = new Mycro({
                connections: {
                    test: {
                        adapter: {},
                        config: {}
                    }
                },
                hooks: ['connections']
            });

        _mycro.start(function(err) {
            expect(err).to.exist;
            done();
        });
    });


    it('should return an error if the adapter\'s `registerConnection` method does not expect two arguments', function(done) {
        var Mycro = require('../../index'),
            _mycro = new Mycro({
                connections: {
                    test: {
                        adapter: {
                            registerConnection: function() {}
                        },
                        config: {}
                    }
                },
                hooks: ['connections']
            });

        _mycro.start(function(err) {
            expect(err).to.exist;
            done();
        });
    });


    it('should return an error if the adapter\'s `registerConnection` method returns an error', function(done) {
        var adapter = {
            registerConnection: function(config, cb) {
                var myconfig = {
                    config: config
                };
                cb(null, myconfig);
            }
        };
        sinon.stub(adapter, 'registerConnection').yieldsAsync(new Error('Something Unexpected'));

        var Mycro = require('../../index'),
            _mycro = new Mycro({
                connections: {
                    test: {
                        adapter: adapter,
                        config: {}
                    }
                },
                hooks: ['connections']
            });

        _mycro.start(function(err) {
            expect(err).to.exist;
            adapter.registerConnection.restore();
            done();
        });
    });


    it('should return an error if the adapter\'s `registerConnection` method does not return a connection object', function(done) {
        var adapter = {
            registerConnection: function(config, cb) {}
        };
        sinon.stub(adapter, 'registerConnection').yieldsAsync();

        var Mycro = require('../../index'),
            _mycro = new Mycro({
                connections: {
                    test: {
                        adapter: adapter,
                        config: {}
                    }
                },
                hooks: ['connections']
            });

        _mycro.start(function(err) {
            expect(err).to.exist;
            adapter.registerConnection.restore();
            done();
        });
    });
});
