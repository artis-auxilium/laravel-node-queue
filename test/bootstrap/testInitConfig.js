'use strict';
/* global app,appdir,*/
/* eslint no-magic-numbers: 0 */
Object.keys(require.cache).forEach(function eachRequireKey(key) {
  delete require.cache[key];
});
var path = require('path');

global.appdir = path.resolve(__dirname, '../../data/base');
var Config = require('../../lib/Config');
var debugLogger = require('debug-logger');

module.exports = {
  setUp: function setUp(callback) {

    global.app = {};
    app.logger = debugLogger;
    app.config = new Config(appdir, app.logger);
    callback();
  },
  tearDown: function tearDown(callback) {
    callback();
  },
  'test create key': function testCreateKey(test) {
    test.expect(1);
    app.config().set('key.to.create', true);
    test.ok(app.config('key.to.create'), 'create missing key');
    test.done();
  },
  'test env': function testEnv(test) {
    test.expect(1);
    process.env.testing = 'testing';
    test.equal(app.config().env('testing'), 'testing', 'env not match');
    process.env.testing = null;
    test.done();
  },
  'test env default': function testEnvDefault(test) {
    test.expect(1);
    test.equal(app.config().env('willNotExist', 'default'), 'default', 'env not match');
    test.done();
  }

};

