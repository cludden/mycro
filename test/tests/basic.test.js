'use strict';

import Mycro from '../../lib';
import test from 'tape';
import pkg from '../../package.json';
import winston from 'winston';
import _ from 'lodash';


import basic from '../apps/basic/app';
import hookError from '../apps/hook-error/app';
import noLogger from '../apps/no-logger/app';


test('basic tests', function(t) {
    const mycro = new Mycro();
    t.equal(typeof mycro, 'object', 'should be an object');
    t.equal(mycro.version, pkg.version, 'should have "version" attribute defined');
    t.equal(mycro.appPath, __dirname, 'should have "appPath" attribute defined');
    t.equal(typeof mycro.config, 'object', 'should have "config" attribute defined');
    t.ok(Object.keys(mycro.config).indexOf('log') !== -1, 'should have "log" config defined');
    t.equal(typeof mycro.logger, 'object', 'should have "logger" attribute defined');
    t.equal(typeof mycro.log, 'function', 'should have "log" method defined');
    t.equal(typeof mycro.start, 'function', 'should have "start" method defined');
    mycro.start(function(err) {
        t.equal(err, null, '#start should not throw');
        t.end();
    });
});

test('should load user config', function(t) {
    t.ok(Object.keys(basic.config).indexOf('test') !== -1, 'should have "test" config defined');
    t.ok(Object.keys(basic.config).indexOf('random') !== -1, 'should have "test" config defined');
    t.ok(Object.keys(basic.config.test).indexOf('foo') !== -1, '"test" config should have "foo" attribute');
    t.equal(typeof basic.config.random.fn, 'function', '"random" config should have "fn" method defined');
    t.equal(basic.config.random.fn(), basic.config.test.foo);
    t.end();
});

test('should override default config with user config', function(t) {
    t.equal(typeof basic.config.log, 'object', 'should have "log" config defined');
    t.notOk(basic.logger instanceof winston.Logger, 'should not be a winston logger');
    t.end();
});

test('should load hooks', function(t) {
    basic.start(function(err) {
        t.equal(err, null, 'should not error');
        t.ok(basic.foo, 'bar', 'should have "foo" property');
        t.ok(basic.bar, 'baz', 'should have "bar" property');
        t.end();
    });
});

test('should allow no logger', function(t) {
    noLogger.start(function(err) {
        t.equal(err, null, 'should not error');
        t.end();
    });
});

test('should throw if hook cannot be resolved', function(t) {
    const err = _.attempt(function() {
        return require('../apps/bad-resolve/app');
    });
    t.ok(err instanceof Error, 'should throw');
    t.end();
});

test('should fail if a hook errors', function(t) {
    hookError.start(function(err) {
        t.ok(err instanceof Error, 'should error');
        t.end();
    });
});

test('should define getter for legacy _config attribute', function(t) {
    t.equal(basic.config, basic._config);
    t.end();
});
