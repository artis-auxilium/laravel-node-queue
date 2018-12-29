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
    callback();
  },
  tearDown: function tearDown(callback) {
    callback();
  },
  'test confirm middelware yes': function confirmMiddelwareYes(test) {
    var stdout = [];
    process.argv = ['node', appdir + '/artisan', 'test:middleware'];
    bddStdin('y\n');
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('are you sure [Yn] ') > -1);
      test.ok(stdout.indexOf('message from function') > -1);
      test.done();
    };
    app.init({
      chdir: appdir + '/'
    });
    app.cmd('test:middleware', [
      shell.routes.confirm('are you sure'),
      function afterMiddleware(req, res) {

        res.print('message from function');

        res.prompt();
      }
    ]);
    app.start();
  },
  'test confirm Middelware No': function confirmMiddelwareNo(test) {
    var stdout = [];
    process.argv = ['node', appdir + '/artisan', 'test:middleware'];
    bddStdin('n\n');
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('are you sure [Yn] ') > -1);
      test.ok(stdout.indexOf('message from function') < 0);
      test.done();
    };
    app.init({
      chdir: appdir + '/'
    });

    app.cmd('test:middleware', [
      shell.routes.confirm('are you sure'),
      function afterMiddleware(req, res) {
        res.print('message from function');
        res.prompt();
      }
    ]);
    app.start();
  },
  'test shell only Middelware No': function confirmMiddelwareNo(test) {
    var stdout = [];
    process.argv = ['node', appdir + '/artisan', 'test:middleware'];
    bddStdin('');
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('Command may only be executed inside a running shell') > -1, 'command may only...');
      test.ok(stdout.indexOf('message from function') < 0, 'message from function');
      test.done();
    };
    app.init({
      chdir: appdir + '/'
    });

    app.cmd('test:middleware', [
      shell.routes.shellOnly,
      function afterMiddleware(req, res) {
        res.print('message from function');
        res.prompt();
      }
    ]);
    app.start();
  },
  'test shell only Middelware Yes': function confirmMiddelwareYes(test) {
    var stdout = [];
    process.argv = ['node', appdir + '/artisan'];
    bddStdin('', 'test:middleware\n', 'quit\n');
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('message from function') > -1, 'dont display message from function');
      test.done();
    };
    app.init({
      chdir: appdir + '/'
    });
    app.cmd('test:middleware', [
      shell.routes.shellOnly,
      function afterMiddleware(req, res) {
        res.print('message from function');
        res.prompt();
      }
    ]);
    app.start();
  },
  'test timeout Middelware': function timeoutMiddelware(test) {
    var stdout = [];
    process.argv = ['node', appdir + '/artisan'];
    bddStdin('test:middleware\n', 'quit\n');
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('Good bye!') > -1);
      test.done();
    };
    app.init({
      chdir: appdir + '/'
    });
    app.on('error', function appError() {
      unhookIntercept();
    });
    app.on('exit', function appError() {
      unhookIntercept();
    });

    var start;
    var second = 1000;
    app.cmd('test:middleware', 'test', [
      function beforemiddleware(req, res, next) {

        start = new Date();
        res.print('start at ').print(start).ln();
        next();
      },
      shell.routes.timeout(2 * second),
      function afterMiddleware(req, res) {
        var end = new Date();
        res.print('end at   ').print(end).ln();
        test.equal(Math.round((end - start) / second), 2, 'time equal');
        res.prompt();
        test.done();
      }
    ]);
    app.start();
  }
};

