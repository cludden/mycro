'use strict';

var chai = require('chai'),
    expect = chai.expect;

describe('[hook] policies', function() {
    it('should load policies at `mycro.policies`', function() {
        expect(mycro.policies).to.be.an('object');
        expect(mycro.policies['able-to']).to.be.a('function');
        expect(mycro.policies['authenticated']).to.be.a('function');
        expect(mycro.policies['blacklist']).to.be.a('function');
        expect(mycro.policies['if']).to.be.a('function');
        expect(mycro.policies['is-equal']).to.be.a('function');
        expect(mycro.policies['member-of']).to.be.a('function');
        expect(mycro.policies['or']).to.be.a('function');
    });

    it('should load non-first level policies at the appropriate path', function() {
        expect(mycro.policies['cache/clear']).to.be.a('function');
    });
});
