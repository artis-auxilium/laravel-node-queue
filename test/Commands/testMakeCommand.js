'use strict';
/* eslint global-require: 0 */
/* global app,appdir*/

var rewire = require('rewire');
var bddStdin = require('../lib/bdd-stdin');
var shell = require('../../lib/shell');
var makeCommand = rewire('../../Commands/makeCommand');
var intercept = require('intercept-stdout');
module.exports = {
  'test make command': function testMakeCommand(test) {
    var stdout = [];
    bddStdin('');
    process.argv = ['node', appdir + '/artisan', 'make:command command'];
    var unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
    });
    global.app = new shell({
      chdir: appdir + '/'
    });
    app.config = rewire('../../bootstrap/config')();
    app.configure(function configureApp() {
      app.use(shell.router({
        shell: app
      }));
    });
    app.on('error', function appError() {
      unhookIntercept();
    })
    app.cmd(makeCommand.pattern, makeCommand.help, makeCommand.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('command created') > -1);
      test.done();
    }
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
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
    });
    global.app = new shell({
      chdir: appdir + '/'
    });
    app.config = rewire('../../bootstrap/config')();
    app.configure(function configureApp() {
      app.use(shell.router({
        shell: app
      }));
    });
    app.on('error', function appError(error) {
      console.log(error);
      unhookIntercept();
    })
    app.cmd(makeCommand.pattern, makeCommand.help, makeCommand.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('file not writable') > -1);
      test.done();
    }
  }

}

