/* jshint expr:true */

var chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect;

describe('[hook] controllers', function() {
    it('should load controllers at `microservice.controllers`', function() {
        expect(microservice.controllers).to.be.an('object');
        expect(microservice.controllers['auth']).to.exist;
        expect(microservice.controllers['auth'].login).to.be.a('function');
        expect(microservice.controllers['auth'].logout).to.be.a('function');
    });

    it('should load non-first level controllers at the appropriate path', function() {
        expect(microservice.controllers['blog/posts']).to.exist;
        expect(microservice.controllers['blog/posts'].create).to.be.a('function');
    });
});
