'use strict';
/* global app,appdir*/
/* eslint global-require :0*/

var rewire = require('rewire');
var bddStdin = require('../../lib/bdd-stdin');
var shell = require('../../../lib/shell');
var intercept = require('intercept-stdout');
module.exports = {
  'test history plugin': function historyPlugin(test) {
    var stdout = [];
    process.argv = ['node', appdir + '/artisan'];
    bddStdin('help\n', bddStdin.keys.up, '\n', 'quit\n');
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
      app.use(shell.history({
        shell: app
      }));
    });
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('>> help') > -1);
      test.done();
    }
  }
}

