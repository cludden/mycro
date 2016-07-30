'use strict';

const faker = require('faker');
const _ = require('lodash');

const userStore = _.range(1, 11).reduce(function(store) {
    const first = faker.name.firstName().toLowerCase();
    const last = faker.name.lastName().toLowerCase();
    const email = first.substr(0, 1) + last + '@example.com';
    const id = faker.random.uuid();
    store[id] = { id, first, last, email };
    return store;
}, {});

module.exports = userStore;
