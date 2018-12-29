'use strict';
/* global app */
/* eslint global-require: 0 */
/* eslint no-magic-numbers: 0 */

var rewire = require('rewire');
var FakeRedis = require('../utils/fake-redis');
var queue = rewire('../../lib/queue');
var intercept = require('intercept-stdout');
var each = require('lodash/each');

module.exports = {
  setUp: function setUp(callback) {
    rewire('../utils/bootstrap');
    callback();
  },
  tearDown: function tearDown(callback) {
    callback();
  },
  'test index': function testIndex(test) {
    test.expect(4);
    var stdout = [];
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    var appTest = rewire('../../bootstrap/app');
    var fakeRedis = new FakeRedis();
    var message = {
      event: 'notfound',
      data: {
        user: 'test',
        otherdata: 'bla'
      }
    };
    fakeRedis.subscribe = function subscribe() {
      setTimeout(function subscribeTimeout() {
        fakeRedis.emit('message', null, JSON.stringify(message));
        message.event = 'example';
        fakeRedis.emit('message', null, JSON.stringify(message));
      }, 10);
    };

    queue.prototype.createJob = function createJob(data) {
      test.deepEqual(data, message.data);
      return this;
    };

    queue.prototype.save = function save() {
      unhookIntercept();
      var toTest = [
        'no job for notfound\n',
        'add job for example\n',
        '{ user: \'test\', otherdata: \'bla\' }\n'

      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1, value);
      });
      test.done();
    };
    global.Queue = queue;

    var redis = function redis() {
      return fakeRedis;
    };
    appTest.__set__({
      Redis: redis,
      Queue: queue,
      console: console
    });

    appTest();
  },
  'test index No Config': function testIndexNoConfig(test) {
    test.expect(1);
    var appTest = rewire('../../bootstrap/app');
    app.config().set('database', null);
    appTest.__set__({
      Queue: queue,
      app: app
    });
    try {
      appTest();
    } catch (error) {
      test.equal('did you have run ./artisan laravel:config ?', error.message);
      test.done();
    }

  }
};

