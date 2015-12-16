/* jshint expr:true */

var chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect;

describe('[hook] controllers', function() {
    it('should load controllers at `microservice.controllers`', function() {
        expect(microservice.controllers).to.be.an('object');
        expect(microservice.controllers['greet']).to.exist;
        expect(microservice.controllers['greet'].aloha).to.be.a('function');
        expect(microservice.controllers['greet'].hello).to.be.a('function');
    });

    it('should load non-first level controllers at the appropriate path', function() {
        expect(microservice.controllers['finance/accounts']).to.exist;
        expect(microservice.controllers['finance/accounts'].getBalance).to.be.a('function');
    });
});
