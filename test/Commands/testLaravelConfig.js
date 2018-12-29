'use strict';
/* eslint global-require: 0 */
/* eslint no-magic-numbers: 0 */
/* global app,appdir*/

var rewire = require('rewire');
var each = require('lodash/each');
var intercept = require('intercept-stdout');
var promise = require('bluebird');
var BddStdin = require('../utils/bdd-stdin');
var shell = require('../../lib/shell');
var fs = require('fs-promise');
var clone = require('lodash/clone');

var laravelConfig, laravel, bddStdin;

module.exports = {
  setUp: function setUp(callback) {
    bddStdin = new BddStdin().type;
    rewire('../utils/bootstrap');
    laravelConfig = rewire('../../Commands/laravelConfig');
    app.configure(function configureApp() {
      app.use(shell.router({
        shell: app
      }));
    });

    laravel = app.config('laravel');
    setTimeout(function waitForStart() {
      callback();
    }, 500);

  },
  tearDown: function tearDown(callback) {
    app.config().set('laravel', laravel);
    callback();
  },
  'test file not writable': function testFileNotWritable(test) {
    var stdout = [];
    bddStdin('');
    process.argv = ['node', appdir + '/artisan', 'laravel:config'];
    var fsMock = {
      writeFile: function writeFile() {
        return promise.reject(new Error('file not writable'));
      },
      mkdir: function mkdir() {
        return promise.resolve();
      }
    };
    laravelConfig.__set__({
      fs: fsMock
    });
    var unhookIntercept = intercept(function onIntercept(txt) {
      try {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      } catch (error) {
        // statements
        stdout.push(txt);
      }

      // return '';
    });
    app.init({
      chdir: appdir + '/'
    });
    app.config().set('laravel.config.example', {
      import: false
    });
    app.on('error', function appError(error) {
      console.log(error);
      unhookIntercept();
    });
    app.cmd(laravelConfig.pattern, laravelConfig.help, laravelConfig.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      console.log(stdout);
      var toTest = [
        'file not writable'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1, value);
      });
      test.done();
    };
    app.start();
  },
  'test write transform fail': function testMakeCommandFail(test) {
    var stdout = [];
    bddStdin('');
    process.argv = ['node', appdir + '/artisan', 'laravel:config'];
    var fsMock = clone(fs);
    fsMock.writeFile = function writeFile(file, content) {
      if ((/Config\/app\.js$/).test(file)) {
        return promise.reject(new Error('file not writable'));
      }
      return fs.writeFile(file, content);
    };

    laravelConfig.__set__({
      fs: fsMock
    });
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    app.init({
      chdir: appdir + '/'
    });
    app.config().set('laravel.config.example', {
      import: false
    });
    app.configure(function configureApp() {
      app.use(shell.router({
        shell: app
      }));
    });
    app.on('error', function appError(error) {
      console.log(error);
      unhookIntercept();
    });

    app.cmd(laravelConfig.pattern, laravelConfig.help, laravelConfig.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        'services created',
        'queue created',
        'broadcasting created',
        'auth created',
        'filesystems created',
        'file not writable'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1, value);
      });
      test.done();
    };
    app.start();
  },
  'test shelljs error': function testShelljsError(test) {
    var stdout = [];
    bddStdin('');
    process.argv = ['node', appdir + '/artisan', 'laravel:config'];
    var shelljsMock = {
      exec: function exec(cmd, options, callback) {
        callback(null, null, new Error('cant make cmd'));
      }
    };

    laravelConfig.__set__({
      shelljs: shelljsMock
    });
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    app.init({
      chdir: appdir + '/'
    });
    app.config().set('laravel.config.example', {
      import: false
    });
    app.on('error', function appError(error) {
      console.log(error);
      unhookIntercept();
    });
    app.cmd(laravelConfig.pattern, laravelConfig.help, laravelConfig.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        'cant make cmd'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1, value);
      });
      test.done();
    };
    app.start();
  },
  'test tmp error': function testTmpError(test) {
    var stdout = [];
    bddStdin('');
    process.argv = ['node', appdir + '/artisan', 'laravel:config'];
    var tmpMock = {
      dir: function dir(options, callback) {
        callback(new Error('error in tmp dir'));
      }
    };

    laravelConfig.__set__({
      tmp: tmpMock
    });
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    app.init({
      chdir: appdir + '/'
    });
    app.config().set('laravel.config.example', {
      import: false
    });

    app.on('error', function appError(error) {
      console.log(error);
      unhookIntercept();
    });

    app.cmd(laravelConfig.pattern, laravelConfig.help, laravelConfig.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        'error in tmp dir'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1, value);
      });
      test.done();
    };
    app.start();
  },
  'test json error': function testJsonError(test) {
    var stdout = [];
    bddStdin('');
    process.argv = ['node', appdir + '/artisan', 'laravel:config'];
    var shelljsMock = {
      exec: function exec(cmd, options, callback) {
        callback(null, 'not a json');
      }
    };

    laravelConfig.__set__({
      shelljs: shelljsMock
    });
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    app.init({
      chdir: appdir + '/'
    });
    app.config().set('laravel.config.example', {
      import: false
    });

    app.on('error', function appError(error) {
      console.log(error);
      unhookIntercept();
    });

    app.cmd(laravelConfig.pattern, laravelConfig.help, laravelConfig.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        'not a json'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1, value);
      });
      test.done();
    };
    app.start();
  },
  'test laravel config ask': function testLaravelConfigAsk(test) {
    var stdout = [];
    bddStdin('\n', 'y\n', 'n\n');
    process.argv = ['node', appdir + '/artisan', 'laravel:config'];
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    app.init({
      chdir: appdir + '/'
    });
    app.config().set('laravel.config.cache', null);
    app.config().set('laravel.config.auth', null);
    app.config().set('laravel.config.queue', null);
    app.config().set('laravel.config.session', {
      import: true,
      asis: false
    });
    app.config().set('laravel.config.example', {
      import: true,
      asis: false
    });
    app.configure(function configureApp() {
      app.use(shell.router({
        shell: app
      }));
    });
    app.on('error', function appError() {
      unhookIntercept();
    });

    app.cmd(laravelConfig.pattern, laravelConfig.help, laravelConfig.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        'services created',
        'queue created',
        'broadcasting created',
        'auth created',
        'filesystems created',
        'database created',
        'mail created',
        'app created'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1, value);
      });
      test.done();
    };
    app.start();
  },
  'test error in user config': function errorInUserConfig(test) {

    var stdout = [];
    bddStdin('\n', 'y\n', 'n\n');
    process.argv = ['node', appdir + '/artisan', 'laravel:config'];
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    app.init({
      chdir: appdir + '/'
    });

    app.config().set('laravel.config.example', {
      import: true,
      asis: false
    });
    app.configure(function configureApp() {
      app.use(shell.router({
        shell: app
      }));
    });
    app.on('error', function appError() {
      unhookIntercept();
    });
    app.cmd(laravelConfig.pattern, laravelConfig.help, laravelConfig.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        'config example not transformed',
        'error in example file'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1, value);
      });
      test.done();
    };
    var example = "module.exports = function compileExampleConfig(config) {";
    example += "throw new Error('error in example file');";
    example += "}";
    fs.writeFile(appdir + '/lib/Config/example.js', example)
      .then(function writeOk() {
        console.log(app.config('laravel.config'));
        app.start();
      });

  }

};

