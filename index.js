/**
 * Created by koala on 2016/9/14.
 */

'use strict';

module.exports = RateLimit;

/**
 * redis数据库中的结构
 * id: 单一用户
 * currentTime： 当前访问的时间戳
 * currentCount： 当前剩余可访问次数，大于0表示可以访问，否则应该拒绝
 */
function getObject(id, currentTime, currentCount) {
    return {
        id,
        currentTime,
        currentCount
    }
};

/**
 * 这是一个令牌桶对象
 * @param options
 * @constructor
 */
function RateLimit(options) {
    options = options || {};
    this.id = options.id || 666;
    this.db = options.db;
    this.limit = options.limit || 100;
    this.interval = options.interval || 100000;
    this.prefix = 'rate_limit:' + this.id + ':';
    this.initBucket((err, obj) => {
        if (typeof obj === 'string')
            obj = JSON.parse(obj);
        this.obj = obj;
    });
}

/**
 * 检查是否可以访问此接口
 * @param callback
 */
RateLimit.prototype.check = function (callback) {
    // TUDO
    let can = this.addToken();
    if (!can) {
        return callback('too fast');
    }
    this.getObj(callback);
};

/**
 * 判断是否需要增加令牌
 * @returns {boolean}
 */
RateLimit.prototype.addToken = function () {
    let now = Date.now();
    // 即将要增加的令牌数
    let addedTokenCount = (now - this.obj.currentTime) * this.limit / this.interval;
    addedTokenCount = Math.floor(addedTokenCount);
    this.obj.currentCount = this.obj.currentCount + addedTokenCount;
    // 不能超过最大值
    this.obj.currentCount = this.obj.currentCount > this.limit ? this.limit : this.obj.currentCount;
    if (addedTokenCount) {
        this.obj.currentTime = now;
    }
    if (this.obj.currentCount <= 0) {
        // this.obj.currentCount = 0;
        // this.setKey(this.prefix, JSON.stringify(this.obj));
        return false;
    }
    this.obj.currentCount--;
    this.setKey(this.prefix, JSON.stringify(this.obj), this.interval/1000);
    return true;
};

/**
 * 分配一个独立空间给单一用户（redis 的 hset）
 */
RateLimit.prototype.initBucket = function (callback) {
    this.getObj((err, data) => {
        if (!data) {
            data = getObject(this.id, Date.now(), this.limit / 2);
            this.setKey(this.prefix, JSON.stringify(data), this.interval/1000);
        }
        callback(null, data);
    });
};

/**
 * 从redis获取令牌桶
 * @param callback
 */
RateLimit.prototype.getObj = function (callback) {
    this.db.get(this.prefix, (err, reply) => {
        if (err) {
            callback(err);
        } else {
            callback(null, reply);
        }
    })
};

RateLimit.prototype.setKey = function (key, value, expire) {
    this.db.set(key, value);
    if (expire) {
        this.db.expire(key, expire);
    }
};

