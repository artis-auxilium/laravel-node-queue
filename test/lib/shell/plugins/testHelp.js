'use strict';
/* global app,appdir*/
/* eslint max-len: 0*/
var rewire = require('rewire');
var BddStdin = require('../../../utils/bdd-stdin');
var shell = require('../../../../lib/shell/');
var intercept = require('intercept-stdout');
var each = require('lodash/each');
var bddStdin;

module.exports = {
  setUp: function setUp(callback) {
    bddStdin = new BddStdin().type;
    rewire('../../../utils/bootstrap');

    callback();
  },
  tearDown: function tearDown(callback) {
    callback();
  },
  'test help plugin default settings': function test1(test) {
    var stdout = [];
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    process.argv = ['node', appdir + '/artisan'];
    bddStdin('help\n', 'quit\n');
    app.init({
      shell: app
    });
    app.use(shell.router({
      shell: app
    }));
    app.use(shell.help({
      shell: app
    }));

    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('Type "help" or press enter for a list of commands\n') > -1);
      test.ok(stdout.indexOf('Available commands:') > -1);
      test.done();
    };
    app.start();
  },
  'test help plugin custom introduction': function customIntroduction(test) {
    var stdout = [];
    process.argv = ['node', appdir + '/artisan'];
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    bddStdin('help\n', 'quit\n');
    app.init({
      shell: app

    });
    app.use(shell.router({
      shell: app
    }));
    app.use(shell.help({
      shell: app,
      introduction: 'custom introduction'
    }));

    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('Available commands:') > -1, 'Available commands:');
      test.ok(stdout.indexOf('custom introduction\n') > -1, 'custom introduction\n');
      test.done();
    };
    app.start();
  },
  'test help plugin help command': function customIntroduction(test) {
    var stdout = [];
    var unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
    });
    process.argv = ['node', appdir + '/artisan'];
    bddStdin('help test\n', 'help test:second\n', 'help test:third\n', 'help not:found\n', 'quit\n');
    app.init({
      shell: app
    });
    app.use(shell.router({
      shell: app
    }));
    app.use(shell.help({
      shell: app,
      introduction: 'custom introduction'
    }));

    app.cmd(
      'test {argument([0-9]+)=default?:test} {2argument:deuxieme argument}       {autre([w+])=pour} {--option:help}',
      'text help',
      function fakeFunction() {}
    );
    app.cmd('test:second', 'text help', function fakeFunction2() {});
    app.cmd('test:third {--option}', 'text help', function fakeFunction2() {});
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        '>> ',
        'Help:',
        'text help',
        'Usage:',
        '[options] [--] ',
        '[<argument>] ',
        '<2argument> ',
        '[<autre>] ',
        'Arguments:',
        '  argument        test [default: "default"]\n  2argument       deuxieme argument \n  autre           [default: "pour"]\n',
        'Options:',
        '--option            ',
        'test:second',
        'test:third ',
        'Options:',
        'command not:found not found',
        'Good bye!'
      ];

      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1, value);
      });
      test.done();
    };
    app.start();
  }
};

