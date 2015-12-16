'use strict';

var chai = require('chai'),
    expect = chai.expect;

describe('[hook] policies', function() {
    it('should load policies at `microservice.policies`', function() {
        expect(microservice.policies).to.be.an('object');
        expect(microservice.policies['authenticated']).to.be.a('function');
        expect(microservice.policies['blacklist']).to.be.a('function');
        expect(microservice.policies['default']).to.be.a('function');
    });
});
