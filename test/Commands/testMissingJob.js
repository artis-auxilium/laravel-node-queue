'use strict';
/* global app,appdir*/
/* eslint global-require: 0 */

var BddStdin = require('../utils/bdd-stdin');
var rewire = require('rewire');
var shell = require('../../lib/shell');
var missingJob = require('../../Commands/missingJob');
var intercept = require('intercept-stdout');

var bddStdin;

module.exports = {
  setUp: function setUp(callback) {
    rewire('../utils/bootstrap');
    bddStdin = new BddStdin().type;

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
  'test Missing Job': function testMissingJob(test) {
    var stdout = [];
    process.argv = ['node', appdir + '/artisan', 'make:job'];
    bddStdin('');
    var unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      // return '';
    });
    app.init({
      chdir: appdir + '/'
    });

    app.on('error', function appError() {
      unhookIntercept();
    });
    app.cmd(missingJob.pattern, missingJob.help, missingJob.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('example created') > -1, 'example created');
      test.done();
    };
    app.start();
  }

};

