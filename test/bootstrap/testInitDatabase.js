'use strict';
/* global app,appdir,*/
/* eslint no-magic-numbers: 0 */
Object.keys(require.cache).forEach(function eachRequireKey(key) {
  delete require.cache[key];
});
var path = require('path');

global.appdir = path.resolve(__dirname, '../../data/base');
var rewire = require('rewire');
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
  'test logging option': function testLoggingOption(test) {
    test.expect(1);
    app.config().set('database.connections.options.logging', true);
    rewire('../../lib/db');
    test.equal('function', typeof app.db.options.logging, 'logger is not function');
    test.done();
  },
  'test without config connexion ': function testNoconnexionOption(test) {
    test.expect(2);
    app.config().set('database', null);
    rewire('../../lib/db');
    test.equal('undefined', typeof app.db, 'db not loaded');
    test.equal('undefined', typeof app.models, 'no models found');
    test.done();
  }

};

