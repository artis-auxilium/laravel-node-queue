'use strict';
/* global app,appdir*/
var rewire = require('rewire');
var BddStdin = require('../../../utils/bdd-stdin');
var shell = require('../../../../lib/shell');
var intercept = require('intercept-stdout');

var bddStdin;
module.exports = {
  setUp: function setUp(callback) {
    rewire('../../../utils/bootstrap');
    bddStdin = new BddStdin().type;

    callback();
  },
  tearDown: function tearDown(callback) {
    callback();
  },
  'test history plugin': function historyPlugin(test) {
    var stdout = [];
    process.argv = ['node', appdir + '/artisan'];
    bddStdin('help\n', BddStdin.keys.up, '\n', 'quit\n');
    var unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      // return '';
    });
    app.init({
      chdir: appdir + '/'
    });
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
    };
    app.start();
  }
};

