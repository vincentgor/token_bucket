# token_bucket
具体用法详见example.js

这是一个用nodejs实现的简陋版令牌桶算法。支持redis和ioredis



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
