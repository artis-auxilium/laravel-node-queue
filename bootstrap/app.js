'use strict';
/* global logger,appdir,config,job */
/* eslint no-eval: 0 */

require('.');
var Redis = require('ioredis');
var console = logger(config.core.log.prefix + ':app');
global.Queue = require('bee-queue');
var includeAll = require('include-all');
/* istanbul ignore next */
var getJob = function Eval(str) {
  //disable jshint error
  var evil = eval;
  var cleanStr = str.replace(/;|\(|\)|{|}/gi, '');
  return evil(cleanStr);
};
/* istanbul ignore if */
if (config.database) {
  global.queueOption = {
    prefix: config.core.queue.prefix,
    redis: config.database.redis
  };
  global.job = includeAll({
    dirname: appdir + '/Jobs',
    filter: /(.+)\.js$/
  });
  var redis = new Redis(config.database.redis);
  redis.subscribe(config.broadcasting.channel || 'laravel-channel');
  redis.on('message', function redisMessage(channel, message) {
    message = JSON.parse(message);
    var jobTodo;
    try {
      jobTodo = getJob('config.app.job.' + message.event);
    } catch (err) {
      jobTodo = null;
    }
    if (!jobTodo || !job[jobTodo]) {
      console.info('no job for ' + message.event);
      console.info(message.data);
      return;
    }
    console.log('add job for ' + message.event);
    job[jobTodo].add(message.data.data);
  });
} else {
  throw new Error('did you have run ./artisan laravel-config ?');
}

