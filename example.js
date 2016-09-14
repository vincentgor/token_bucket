/**
 * Created by koala on 2016/9/14.
 */

'use strict';

const redis = require('ioredis');
const db = redis.createClient();

const Limit = require('./');

const interfaceIdArray= ['_300', '_550'];
const id = '23333';

const limiter_300 = new Limit({
    id: id,
    db: db,
    interfaceId: interfaceIdArray[0]
});
const limiter_550 = new Limit({
    id: id,
    db: db,
    interfaceId: interfaceIdArray[1]
});

// 模拟请求（300毫秒一次）
setInterval(() => {
    limiter_300.check((err, data) => {
        if (err) {
            console.log('err', err);
        } else {
            console.log('data', data);
        }
    });
}, 300);

// 模拟请求（550毫秒一次）
setInterval(() => {
    limiter_550.check((err, data) => {
        if (err) {
            console.log('err', err);
        } else {
            console.log('data', data);
        }
    });
}, 550);