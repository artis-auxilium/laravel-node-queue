'use strict';

/* global app,appdir */

global.app = {};
require('.');
var Redis = require('ioredis');
var logPrefix = app.config('core.log.prefix');
var console = app.logger(logPrefix + ':app');
var includeAll = require('include-all');

global.Queue = require('bee-queue');

module.exports = function startApp() {
  if (app.config('database')) {
    app.queueOption = {
      prefix: app.config('core.queue.prefix'),
      redis: app.config('database.redis')
    };
    app.job = includeAll({
      dirname: appdir + '/Jobs',
      filter: /(.+)\.js$/
    });
    var redis = new Redis(app.config('database.redis'));

    redis.subscribe(app.config('broadcasting.channel') || 'laravel-channel');
    redis.on('message', function redisMessage(channel, message) {
      message = JSON.parse(message);
      var jobTodo = app.config('app.job.' + message.event);

      if (!jobTodo || !app.job[jobTodo]) {
        console.info('no job for ' + message.event);
        console.info(message.data);
        return;
      }
      console.log('add job for ' + message.event);
      app.job[jobTodo].add(message.data);
    });
  } else {
    throw new Error('did you have run ./artisan laravel:config ?');
  }
};

