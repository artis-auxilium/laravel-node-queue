'use strict';

var util = require('util');
var events = require('events');
var EventEmitter = events.EventEmitter;

var Redis = function Redis() {
  Redis.super_.call(this);
};

util.inherits(Redis, EventEmitter);

module.exports = Redis;

