'use strict';
/* global app,appdir*/
/* eslint global-require: 0 */
/* eslint max-len: 0 */

var rewire = require('rewire');
var path = require('path');
var bddStdin = require('../lib/bdd-stdin');
var shell = require('../../lib/shell');
var init = require('../../Commands/init');
var laravelConfig = require('../../Commands/laravelConfig');
var intercept = require('intercept-stdout');
var each = require('lodash/each');

var stdout;
var unhookIntercept;

module.exports = {
  setUp: function setUp(cb) {
    stdout = [];
    process.argv = ['node', appdir + '/artisan'];

    var laraveldir = path.resolve(__dirname, '../data/laravel_fa');
    bddStdin([
      'ini\t',
      '\n',
      '\t',
      'lib',
      '\t',
      '\t',
      bddStdin.keys.delete,
      bddStdin.keys.delete,
      bddStdin.keys.delete,
      bddStdin.keys.delete,
      bddStdin.keys.delete,
      bddStdin.keys.delete,
      bddStdin.keys.delete,
      bddStdin.keys.delete,
      bddStdin.keys.delete,
      bddStdin.keys.delete,
      laraveldir,
      '\t',
      '\t',
      '\n',
      '\n',
      ' \n'
    ]);

    unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      // return '';
    });
    global.app = new shell({
      chdir: appdir + '/'
    });
    app.config = rewire('../../bootstrap/config')();
    app.config.laravel.addToApp = {
      job: {
        example: "example"
      }
    };
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
    })
    app.cmd(init.pattern, init.help, init.function);
    app.cmd(laravelConfig.pattern, laravelConfig.help, laravelConfig.function);
    cb();
  },
  'test init': function testInit(test) {

    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        'path to laravel project: ',
        'install command on laravel v5.2.43',
        'path to commands folder: [app/Console/Commands/] ',
        'command copied to /var/node/test-laraqueue/node_modules_fake/laravel-queue/test/data/laravel_fake/app/Console/Commands/NodeConfig.php',
        'add "\\App\\Console\\Commands\\NodeConfig::class" to /var/node/test-laraqueue/node_modules_fake/laravel-queue/test/data/laravel_fake/app/Console/kernel.php',
        'when done type enter ',
        'services created',
        'queue created',
        'broadcasting created',
        'auth created',
        'filesystems created',
        'database created',
        'mail created',
        'app created'
      ]
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1);
      });
      test.done();
    }

  },
  'test init allready': function testInitAllready(test) {

    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        'path to laravel project: ',
        'install command on laravel v5.2.43',
        'path to commands folder: [app/Console/Commands/] ',
        'NodeConfig.php allready in your laravel project',
        'maybe you need to add "\\App\\Console\\Commands\\NodeConfig::class" to /var/node/test-laraqueue/node_modules_fake/laravel-queue/test/data/laravel_fake/app/Console/kernel.php',
        'when done type enter ',
        'services created',
        'queue created',
        'broadcasting created',
        'auth created',
        'filesystems created',
        'database created',
        'mail created',
        'app created'
      ]
      each(toTest, function eachToTest(value) {
        test.ok(stdout.indexOf(value) > -1);
      });
      test.done();
    }

  }
}

