/* jshint expr:true */
var expect = require('chai').expect;

describe('[hook] controllers', function() {
    it('should load controllers at `mycro.controllers`', function() {
        expect(mycro.controllers).to.be.an('object');
        expect(mycro.controllers['auth']).to.exist;
        expect(mycro.controllers['auth'].login).to.be.a('function');
        expect(mycro.controllers['auth'].logout).to.be.a('function');
    });

    it('should load non-first level controllers at the appropriate path', function() {
        expect(mycro.controllers['blog/posts']).to.exist;
        expect(mycro.controllers['blog/posts'].create).to.be.a('function');
    });

    it('should allow controllers to be implemented as functions that accept the mycro instance', function() {
        expect(mycro.controllers.greet).to.exist;
        expect(mycro.controllers.greet.hello).to.be.a('function');
        expect(mycro.controllers.greet.goodbye).to.be.a('function');
    });
});
