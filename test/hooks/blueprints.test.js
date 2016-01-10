/* jshint expr:true */
'use strict';

var expect = require('chai').expect,
    Microservice = require('../../index'),
    supertest = require('supertest');


var cwd,
    request,
    ms;

before(function() {
    cwd = process.cwd();
    process.chdir(__dirname + '/blueprints/test-app');
    // TODO understand supertest
    //request = supertest.agent(microservice.server);
});

after(function() {
    process.chdir(cwd);
});


describe('[hook] blueprints', function() {

    describe('controllers', function() {

        beforeEach(function(done) {
            ms = new Microservice();
            ms.start(done);
        });

        it('creates a new controller', function() {
            expect(ms.controllers.user).to.exist;
        });

        describe('overriding controllers', function() {

        });
    });

    describe('routes', function() {

        describe('overriding routes', function() {

        });
    });
});