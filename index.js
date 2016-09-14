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
let obj = {
    id: 1,
    currentTime: 0,
    currentCount: 100
};

function RateLimit(options) {
    options = options || {};
    this.id = options.id || 666;
    this.db = options.db;
    this.limit = options.limit || 100;
    this.interval = options.interval || 100000;
    this.prefix = 'rate_limit:' + this.id + ':';
}

/**
 * 检查是否可以访问此接口
 * @param callback
 */
RateLimit.prototype.check = function (callback) {
    // TUDO
    let can = this.addToken();
    if (!can) {
        return callback('too fast', obj);
    }
    return callback(null, obj);
};


RateLimit.prototype.addToken = function () {
    let now = Date.now();
    // 即将要增加的令牌数
    let addedTokenCount = (now - obj.currentTime) * this.limit / this.interval;
    console.log('addedTokenCount', addedTokenCount)
    addedTokenCount = Math.floor(addedTokenCount);
    obj.currentCount = obj.currentCount + addedTokenCount;
    // 不能超过最大值
    obj.currentCount = obj.currentCount > this.limit ? this.limit : obj.currentCount;
    if (addedTokenCount) {
        obj.currentTime = now;
    }
    if (obj.currentCount <= 0) {
        obj.currentCount = 0;
        return false;
    }
    obj.currentCount--;
    return true
};

