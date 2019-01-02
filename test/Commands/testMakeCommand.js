'use strict';
/* eslint global-require: 0 */
/* global app,appdir*/

var rewire = require('rewire');
var BddStdin = require('../utils/bdd-stdin');
var shell = require('../../lib/shell');
var makeCommand = rewire('../../Commands/makeCommand');
var intercept = require('intercept-stdout');

var bddStdin;
module.exports = {
  setUp: function setUp(callback) {
    bddStdin = new BddStdin().type;
    rewire('../utils/bootstrap');
    app.configure(function configureApp() {
      app.use(shell.router({
        shell: app
      }));
    });
    callback();
  },
  tearDown: function tearDown(callback) {
    callback();
  },
  'test make command': function testMakeCommand(test) {
    var stdout = [];
    bddStdin('');
    process.argv = ['node', appdir + '/artisan', 'make:command command'];
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
      return '';
    });
    app.init({
      chdir: appdir + '/'
    });
    app.on('error', function appError() {
      unhookIntercept();
    });
    app.cmd(makeCommand.pattern, makeCommand.help, makeCommand.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('command created') > -1, 'command not created');
      test.done();
    };
    app.start();
  },
  'test make command fail': function testMakeCommandFail(test) {
    var stdout = [];
    bddStdin('');
    process.argv = ['node', appdir + '/artisan', 'make:command command'];
    var fsMock = {
      writeFile: function writeFile() {
        return Promise.reject(new Error('file not writable'));
      }
    };
    makeCommand.__set__({
      fs: fsMock
    });
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
      return '';
    });
    app.init({
      chdir: appdir + '/'
    });

    app.on('error', function appError(error) {
      console.log(error);
      unhookIntercept();
    });
    app.cmd(makeCommand.pattern, makeCommand.help, makeCommand.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('file not writable') > -1, 'file not writable');
      test.done();
    };
    app.start();
  }

};

