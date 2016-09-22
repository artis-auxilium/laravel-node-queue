'use strict';
/* global db,config*/
/* eslint no-magic-numbers:0*/
var rewire = require('rewire');
module.exports = {
  setUp: function setUp(callback) {
    callback();
  },
  tearDown: function tearDown(callback) {
    delete global.db;
    delete global.Models;
    callback();
  },
  'test logging option': function testLoggingOption(test) {
    test.expect(1);
    global.config = rewire('../../bootstrap/config')();
    config.database.connections.options.logging = true;
    rewire('../../bootstrap/database');
    test.equal('function', typeof db.options.logging.logger);
    test.done();
  },
  'test without config connexion ': function testNoconnexionOption(test) {
    test.expect(2);
    global.config = rewire('../../bootstrap/config')();
    delete config.database;
    rewire('../../bootstrap/database');
    test.equal('undefined', typeof db);
    test.equal('undefined', typeof Models);
    test.done();
  }

};
