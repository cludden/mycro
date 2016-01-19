/* jshint expr:true */
'use strict';

var chai = require('chai'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect;

chai.use(sinonChai);

before(function(done) {
    process.chdir(__dirname + '/test-app');

    var Mycro = require('../'),
        mycro = new Mycro();
    global['mycro'] = mycro;

    mycro.start(function(err) {
        expect(err).to.not.exist;
        done(err);
    });
});
