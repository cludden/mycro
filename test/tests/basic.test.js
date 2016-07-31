'use strict';

const Mycro = require('../../lib');
const test = require('tape-expect');
const version = require('../../package.json').version;
const winston = require('winston');

const basic = require('../apps/basic/app');

test('basic tests', function(t) {
    t.expect(Mycro).to.be.a('function');
    t.expect(Mycro).to.not.throwException();

    const mycro = new Mycro();
    t.expect(mycro).to.be.an('object');

    t.expect(mycro).to.have.property('version', version);

    t.expect(mycro).to.have.property('config');
    t.expect(mycro.config).to.be.an('object');
    t.expect(mycro.config).to.have.keys('log');

    t.expect(mycro).to.have.property('logger');
    t.expect(mycro.logger).to.be.an('object');

    t.expect(mycro).to.have.property('log');
    t.expect(mycro.log).to.be.a('function');

    t.expect(mycro).to.have.property('start');
    t.expect(mycro.start).to.be.a('function');
    mycro.start(function(err) {
        t.expect(err).to.be(null);
        t.end();
    });
});

test('should load user config', function(t) {
    t.expect(basic.config).to.have.keys('test', 'random');
    t.expect(basic.config.test).to.have.property('foo', 'bar');
    t.expect(basic.config.random).to.have.property('fn');
    t.expect(basic.config.random.fn()).to.equal(basic.config.test.foo);
    t.end();
});

test('should override default config with user config', function(t) {
    t.expect(basic.config.log).to.have.property('options');
    t.notOk(basic.logger instanceof winston.Logger);
    t.end();
});

test('should load hooks', function(t) {
    basic.start(function(err) {
        t.expect(err).to.be(null);
        t.expect(basic).to.have.property('foo', 'bar');
        t.expect(basic).to.have.property('bar', 'baz');
        t.end();
    });
});

test('should allow no logger', function(t) {
    const noLogger = require('../apps/no-logger/app');
    noLogger.start(function(err) {
        t.expect(err).to.be(null);
        t.end();
    });
});

test('should throw if hook cannot be resolved', function(t) {
    t.expect(require).withArgs('../apps/bad-resolve/app').to.throwException();
    t.end();
});

test('should fail if a hook errors', function(t) {
    const hookError = require('../apps/hook-error/app');
    hookError.start(function(err) {
        t.ok(err instanceof Error);
        t.end();
    });
});
