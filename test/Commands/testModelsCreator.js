'use strict';
/* eslint global-require: 0 */
/* global app,appdir,config*/

var rewire = require('rewire');
var bddStdin = require('../lib/bdd-stdin');
var shell = require('../../lib/shell');
var intercept = require('intercept-stdout');
var modelsCreator = require('../../Commands/modelsCreator');
var each = require('lodash/each');
module.exports = {
  setUp: function setUp(callback) {
    callback();
  },
  'test model creator': function testModelsCreator(test) {
    var stdout = [];
    bddStdin('');
    process.argv = ['node', appdir + '/artisan', 'make:models'];
    global.app = new shell({
      chdir: appdir + '/'
    });
    var unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      // return '';
    });
    app.config = rewire('../../bootstrap/config')();
    global.config = app.config;
    rewire('../../bootstrap/database');
    app.configure(function configureApp() {
      app.use(shell.router({
        shell: app
      }));
    });
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
    }
  },
  'test model creator custom folder': function testModelsCreatorCustomFolder(test) {
    var stdout = [];
    bddStdin('');
    process.argv = ['node', appdir + '/artisan', 'make:models'];
    global.app = new shell({
      chdir: appdir + '/'
    });
    var unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      // return '';
    });
    app.config = rewire('../../bootstrap/config')();

    global.config = app.config;
    config.core.modelsCreator.modelsFolder = 'ModelsNew'
    rewire('../../bootstrap/database');
    app.configure(function configureApp() {
      app.use(shell.router({
        shell: app
      }));
    });
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
    }
  },
  'test model creator without models': function testModelsCreatorWithoutModels(test) {
    var stdout = [];
    bddStdin('');
    process.argv = ['node', appdir + '/artisan', 'make:models'];
    global.app = new shell({
      chdir: appdir + '/'
    });
    var unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      // return '';
    });
    app.config = rewire('../../bootstrap/config')();

    global.config = app.config;
    config.core.modelsCreator.models = []
    rewire('../../bootstrap/database');
    app.configure(function configureApp() {
      app.use(shell.router({
        shell: app
      }));
    });
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
    }
  }
}

