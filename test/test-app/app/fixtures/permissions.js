'use strict';

module.exports = [{
    id: 1,
    type: 'ability',
    resource: 'users',
    groups: [
        1
    ],
    data: {
        ability: 'manage'
    }
},{
    id: 2,
    type: 'ability',
    resource: 'groups',
    groups: [
        1
    ],
    data: {
        ability: 'manage'
    }
},{
    id: 3,
    type: 'cache',
    resource: 'cache',
    data: {
        path: 'users:*',
        groups: [
            1
        ]
    }
},{
    id: 4,
    type: 'cache',
    resource: 'cache',
    data: {
        path: 'groups:*',
        groups: [
            2
        ]
    }
}];
