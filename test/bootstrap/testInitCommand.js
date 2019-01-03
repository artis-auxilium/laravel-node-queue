'use strict';
/* global app,appdir*/
/* eslint global-require: 0*/

var rewire = require('rewire');
var BddStdin = require('../utils/bdd-stdin');
var shell = require('../../lib/shell');
var intercept = require('intercept-stdout');
var each = require('lodash/each');
var path = require('path');
global.appdir = path.resolve(__dirname, '../../data/base');
var bddStdin;

module.exports = {
  setUp: function setUp(callback) {
    bddStdin = new BddStdin().type;
    callback();
  },
  tearDown: function tearDown(callback) {
    callback();
  },
  'test load bootstrap index': function loadBootstrapIndex(test) {
    var stdout = [];
    process.argv = ['node', appdir + '/artisan', 'help'];
    bddStdin('');
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
      // return '';
    });
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        'Available commands:'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1);
      });
      test.done();
    };
    require('../../bootstrap/commands');

  },
  'test command not found': function testCommandNotFound(test) {

    var stdout = [];
    process.argv = ['node', appdir + '/artisan', 'command:notfound'];
    bddStdin('');
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
      return '';
    });
    rewire('../utils/bootstrap');
    app.init({
      chdir: appdir + '/'
    });
    app.configure(function configureApp() {
      app.use(shell.router({
        shell: app
      }));
    });
    app.on('error', function appError() {
      unhookIntercept();
    });
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('No command found at command:notfound') > -1);
      test.done();
    };
    app.start();
  }

};

