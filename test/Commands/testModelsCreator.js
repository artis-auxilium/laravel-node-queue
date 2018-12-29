'use strict';
/* eslint global-require: 0 */
/* global app,appdir*/

var rewire = require('rewire');
var BddStdin = require('../utils/bdd-stdin');
var Shell = require('../../lib/shell');
var intercept = require('intercept-stdout');
var modelsCreator = require('../../Commands/modelsCreator');
var each = require('lodash/each');
var Config = require('../../lib/Config');
var debugLogger = require('debug-logger');
var database, core, bddStdin;
var globalApp;
module.exports = {
  setUp: function setUp(callback) {
    bddStdin = new BddStdin().type;
    rewire('../utils/bootstrap');
    globalApp = global.app;
    app.configure(function configureApp() {
      app.use(Shell.router({
        shell: app
      }));
    });

    database = app.config('database');
    core = app.config('core');
    callback();
  },
  tearDown: function tearDown(callback) {
    globalApp.config().set('database', database);
    globalApp.config().set('core', core);
    callback();
  },
  'test model creator': function testModelsCreator(test) {
    var stdout = [];
    bddStdin('');
    process.argv = ['node', appdir + '/artisan', 'make:models'];
    var unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      // return '';
    });
    app.init({
      chdir: appdir + '/'
    });

    rewire('../../lib/db');

    app.on('error', function appError() {
      unhookIntercept();
    });
    app.cmd(modelsCreator.pattern, modelsCreator.help, modelsCreator.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        'User is created',
        'all models are generated from db'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1);
      });
      test.done();
    };
    app.start();
  },
  'test model creator custom folder': function testModelsCreatorCustomFolder(test) {
    var stdout = [];
    bddStdin('');
    process.argv = ['node', appdir + '/artisan', 'make:models'];
    var unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      // return '';
    });
    app.init({
      chdir: appdir + '/'
    });
    app.config().set('core.modelsCreator.modelsFolder', 'ModelsNew');
    rewire('../../lib/db');
    app.on('error', function appError() {
      unhookIntercept();
    });

    app.cmd(modelsCreator.pattern, modelsCreator.help, modelsCreator.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        'User is created',
        'all models are generated from db'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1);
      });

      test.done();
    };
    app.start();
  },
  'test model creator without models': function testModelsCreatorWithoutModels(test) {
    var stdout = [];
    bddStdin('');
    process.argv = ['node', appdir + '/artisan', 'make:models'];
    var unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      // return '';
    });
    app.init({
      chdir: appdir + '/'
    });
    app.config().set('core.modelsCreator.models', []);
    rewire('../../lib/db');
    app.on('error', function appError() {
      unhookIntercept();
    });

    app.cmd(modelsCreator.pattern, modelsCreator.help, modelsCreator.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();

      var toTest = [
        'Please add models to import in Config/core.js'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1);
      });

      test.done();
    };
    app.start();
  },
  'test model creator without database': function testModelsCreatorWithoutDatabase(test) {
    var stdout = [];
    bddStdin('');

    global.app = new Shell();
    app.logger = debugLogger;
    app.config = new Config(appdir, app.logger);
    app.configure(function configureApp() {
      app.use(Shell.router({
        shell: app
      }));
    });

    process.argv = ['node', appdir + '/artisan', 'make:models'];
    var unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      // return '';
    });
    app.init({
      chdir: appdir + '/'
    });
    app.config().set('database', null);
    rewire('../../lib/db');
    app.on('error', function appError() {
      unhookIntercept();
    });

    app.cmd(modelsCreator.pattern, modelsCreator.help, modelsCreator.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();

      var toTest = [
        'database not configured'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1);
      });

      test.done();
    };
    app.start();
  },
  'test model creator with database error': function testModelsCreatorWithDatabaseError(test) {
    var stdout = [];
    bddStdin('');
    global.app = new Shell();
    app.logger = debugLogger;
    app.config = new Config(appdir, app.logger);
    app.configure(function configureApp() {
      app.use(Shell.router({
        shell: app
      }));
    });
    process.argv = ['node', appdir + '/artisan', 'make:models'];
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    app.init({
      chdir: appdir + '/'
    });
    app.config().set('database.connections.database', 'notexist');
    rewire('../../lib/db');
    app.on('error', function appError() {
      unhookIntercept();
    });

    app.cmd(modelsCreator.pattern, modelsCreator.help, modelsCreator.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();

      var toTest = [
        "Access denied for user 'testdb'@'localhost' to database 'notexist'"
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1, value);
      });

      test.done();
    };
    app.start();
  }
};

