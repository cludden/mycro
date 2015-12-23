'use strict';

var chai = require('chai'),
    expect = chai.expect;

describe('[hook] policies', function() {
    it('should load policies at `microservice.policies`', function() {
        expect(microservice.policies).to.be.an('object');
        expect(microservice.policies['able-to']).to.be.a('function');
        expect(microservice.policies['authenticated']).to.be.a('function');
        expect(microservice.policies['blacklist']).to.be.a('function');
        expect(microservice.policies['if']).to.be.a('function');
        expect(microservice.policies['is-equal']).to.be.a('function');
        expect(microservice.policies['member-of']).to.be.a('function');
        expect(microservice.policies['or']).to.be.a('function');
    });

    it('should load non-first level policies at the appropriate path', function() {
        expect(microservice.policies['cache/clear']).to.be.a('function');
    });
});
