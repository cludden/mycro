'use strict';

export default function getConfig(mycro) {
    return {
        fn() {
            return mycro.config.test.foo;
        }
    };
}
