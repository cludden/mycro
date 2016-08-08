'use strict';

export default [
    function anonymous(done) {
        process.nextTick(function() {
            done(new Error('something went wrong'));
        });
    }
];
