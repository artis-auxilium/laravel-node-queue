'use strict';
/* global config*/
/* eslint global-require: 0 */
var rewire = require('rewire');
module.exports = {
  setUp: function setUp(callback) {
    callback();
  },
  tearDown: function tearDown(callback) {
    callback();
  },
  'test index No Config': function testIndexNoConfig(test) {
    test.expect(1);
    global.config = rewire('../../bootstrap/config');
    config.database = null;

    test.throws(function throwIndexError() {
      require('../../bootstrap/app');
    }, Error, 'did you have run ./artisan laravel-config ?');
    test.done();
  }
};

