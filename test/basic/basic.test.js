/* jshint expr:true */
'use strict';

var expect = require('chai').expect,
    sinon = require('sinon');

describe('restify-microservice', function() {
    it('should allow config files to access the microservice object', function() {
        expect(microservice._config.test.something).to.equal('something else');
    });


    it('should attempt to load hooks from node_modules', function(done) {
        var originalDir = process.cwd();
        process.chdir(__dirname + '/../test-app-2');

        sinon.spy(require('../../hooks/routes'), 'hook');
        var Microservice = require('../../index'),
            m = new Microservice({
                hooks: [
                    'restify-microservice-mongoose-rest'
                ]
            });

        m.start(function(err) {
            expect(err).to.not.exist;
            require('../../hooks/routes').hook.restore();
            process.chdir(originalDir);
            done();
        });
    });


    it('should throw an error if string hooks cannot be found in this package or in node_modules', function(done) {
        var originalDir = process.cwd();
        process.chdir(__dirname + '/../test-app-2');

        var Microservice = require('../../index'),
            m = new Microservice({
                hooks: [
                    'something-totally-made-up'
                ]
            });

        m.start(function(err) {
            expect(err).to.exist;
            process.chdir(originalDir);
            done();
        });
    });


    it('should throw an error if any hook returns an error', function(done) {
        var originalDir = process.cwd();
        process.chdir(__dirname + '/../test-app-2');

        sinon.stub(require('../../hooks/routes'), 'hook').yieldsAsync('Something unexpected');
        var Microservice = require('../../index'),
            m = new Microservice({
                hooks: [
                    'server',
                    'routes'
                ]
            });

        m.start(function(err) {
            expect(err).to.exist;
            expect(require('../../hooks/routes').hook).to.have.been.called;
            require('../../hooks/routes').hook.restore();
            process.chdir(originalDir);
            done();
        });
    });


    it('should ignore non-string and non-function hooks', function(done) {
        var originalDir = process.cwd();
        process.chdir(__dirname + '/../test-app-2');

        var Microservice = require('../../index'),
            m = new Microservice({
                hooks: [
                    'server',
                    'routes',
                    3,
                    {hook: 'does not matter'}
                ]
            });

        m.start(function(err) {
            expect(err).to.not.exist;
            process.chdir(originalDir);
            done();
        });
    });


    it('should only start the server when a numeric port is provided and a `microservice.server.listen` method is defined', function(done) {
        var originalDir = process.cwd();
        process.chdir(__dirname + '/../test-app-2');

        var Microservice = require('../../index'),
            m = new Microservice({
                server: {
                    port: 'abc'
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
