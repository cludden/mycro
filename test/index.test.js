'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

chai.use(sinonChai);

before(function(done) {
    process.chdir(__dirname + '/test-app');

    const Mycro = require('../');
    const mycro = new Mycro();
    global['mycro'] = mycro;

    mycro.start(function(err) {
        expect(err).to.not.exist;
        done(err);
    });
});
