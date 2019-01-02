'use strict';
/* global app,appdir*/
/* eslint global-require: 0 */
/* eslint max-len: 0 */

var rewire = require('rewire');
var path = require('path');
var BddStdin = require('../utils/bdd-stdin');
var shell = require('../../lib/shell');
var intercept = require('intercept-stdout');
var each = require('lodash/each');
var laravelConfig = require('../../Commands/laravelConfig');
var laraveldir = path.resolve(__dirname, '../data/laravel_fake');
var stdout;
var init;
var unhookIntercept;
var userInput = [
  [
    'init\n',
    laraveldir,
    '\t',
    '\t',
    '\n',
    '\n',
    'quit\n'
  ],
  [
    'init\n',
    laraveldir,
    '\t',
    '\t',
    '\n',
    '\n',
    'quit\n'
  ],
  [
    'ini\t',
    '\n',
    '\t',
    'lib',
    '\t',
    '\t',
    BddStdin.keys.delete,
    BddStdin.keys.delete,
    BddStdin.keys.delete,
    BddStdin.keys.delete,
    BddStdin.keys.delete,
    BddStdin.keys.delete,
    BddStdin.keys.delete,
    BddStdin.keys.delete,
    BddStdin.keys.delete,
    BddStdin.keys.delete,
    laraveldir,
    '\t',
    '\t',
    '\n',
    '\n',
    ' \n'
  ],
  [
    'init\n',
    laraveldir,
    '\t',
    '\t',
    '\n',
    '\n',
    ' \n'
  ],
  [
    'init\n',
    laraveldir,
    '\t',
    '\t',
    '\n',
    'quit\n'
  ],
  [
    'init\n',
    laraveldir,
    '\t',
    '\t',
    '\n',
    'quit\n'
  ]

];

module.exports = {
  setUp: function setUp(cb) {
    var bddStdin = new BddStdin().type;
    rewire('../utils/bootstrap');
    init = rewire('../../Commands/init');
    stdout = [];
    process.argv = ['node', appdir + '/artisan'];

    bddStdin(userInput.shift());

    unhookIntercept = intercept(function onIntercept(txt) {
      if (typeof txt === 'string') {
        stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      }
      return '';
    });
    app.init({
      chdir: appdir + '/'
    });
    app.config().set('laravel.addToApp', {
      job: {
        example: "example"
      }
    });
    app.config().set('laravel.config.example', {
      import: false
    });
    app.configure(function configureApp() {
      app.use(shell.router({
        shell: app
      }));
      app.use(shell.completer({
        shell: app
      }));
    });
    app.on('error', function appError() {
      unhookIntercept();
    });
    app.cmd(init.pattern, init.help, init.function);
    app.cmd(laravelConfig.pattern, laravelConfig.help, laravelConfig.function);
    cb();
  },
  'test cp error': function testCpError(test) {

    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();

      var toTest = [
        'command not executed'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1, value);
      });
      test.done();
    };
    var shellJsMock = {
      exec: function exec(cmd, opt, cb) {
        return cb(null, 'Laravel Framework version 5.2.43');
      },
      cp: function exec() {
        return {
          stderr: new Error('command not executed')
        };
      }
    };
    init.__set__({
      shelljs: shellJsMock
    });
    app.start();
  },
  'test cp throw error': function testCpThrowError(test) {

    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();

      var toTest = [
        'command not executed'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1, value);
      });
      test.done();
    };
    var shellJsMock = {
      exec: function exec(cmd, opt, cb) {
        return cb(null, 'Laravel Framework version 5.2.43');
      },
      cp: function exec() {
        throw new Error('command not executed');
      }
    };
    init.__set__({
      shelljs: shellJsMock
    });
    app.start();
  },
  'test init': function testInit(test) {

    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        'path to laravel project: ',
        'install command on laravel v5.2.43',
        'path to commands folder: [app/Console/Commands/] ',
        `command copied to ${laraveldir}/app/Console/Commands/NodeConfig.php`,
        `add "\\App\\Console\\Commands\\NodeConfig::class" to ${laraveldir}/app/Console/kernel.php`,
        'when done type enter ',
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
  'test init allready': function testInitAllready(test) {

    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        'path to laravel project: ',
        'install command on laravel v5.2.43',
        'path to commands folder: [app/Console/Commands/] ',
        'NodeConfig.php allready in your laravel project',
        `maybe you need to add "\\App\\Console\\Commands\\NodeConfig::class" to ${laraveldir}/app/Console/kernel.php`,
        'when done type enter ',
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
  'test Not laravel': function testNotLaravel(test) {

    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();

      var toTest = [
        'not a laravel framework'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1, value);
      });
      test.done();
    };
    var shellJsMock = {
      exec: function exec(cmd, opt, cb) {
        return cb(null, 'another framework v1.2.3');
      }
    };
    init.__set__({
      shelljs: shellJsMock
    });
    app.start();
  },
  'test cmd error': function testCmdError(test) {

    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();

      var toTest = [
        'command not executed'
      ];
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1, value);
      });
      test.done();
    };
    var shellJsMock = {
      exec: function exec(cmd, opt, cb) {
        return cb(null, null, new Error('command not executed'));
      }
    };
    init.__set__({
      shelljs: shellJsMock
    });
    app.start();
  }
};

