'use strict';
/* global app,appdir*/

var rewire = require('rewire');
var bddStdin = require('../../lib/bdd-stdin');
var shell = require('../../../lib/shell');
var intercept = require('intercept-stdout');
module.exports = {
  'test help plugin default settings': function test1(test) {
    var stdout = [];
    process.argv = ['node', appdir + '/artisan'];
    bddStdin('help\n', 'quit\n');
    var unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      // return '';
    });
    global.app = new shell({
      chdir: appdir + '/'
    });
    app.config = rewire('../../../bootstrap/config')();
    app.configure(function configureApp() {
      app.use(shell.router({
        shell: app
      }));
      app.use(shell.help({
        shell: app,
        introduction: true
      }));
    });
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('Type "help" or press enter for a list of commands\n') > -1);
      test.ok(stdout.indexOf('Available commands:') > -1);
      test.done();
    }
  },
  'test help plugin custom intoduction': function customIntroduction(test) {
    var stdout = [];
    process.argv = ['node', appdir + '/artisan'];
    bddStdin('help\n', 'quit\n');
    var unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      // return '';
    });
    global.app = new shell({
      chdir: appdir + '/'
    });
    app.config = rewire('../../../bootstrap/config')();
    app.configure(function configureApp() {
      app.use(shell.router({
        shell: app
      }));
      app.use(shell.help({
        shell: app,
        introduction: 'custom introduction'
      }));
    });
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('Available commands:') > -1);
      test.ok(stdout.indexOf('custom introduction\n') > -1);
      test.done();
    }
  }
}
