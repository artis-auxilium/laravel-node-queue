'use strict';
/* global app,appdir*/
/* eslint global-require :0 */

var rewire = require('rewire');
var path = require('path');
var bddStdin = require('../lib/bdd-stdin');
var shell = require('../../lib/shell');
var init = require('../../Commands/init');
var laravelConfig = require('../../Commands/laravelConfig');
var intercept = require('intercept-stdout');
module.exports = {
  'test init': function test1(test) {
    var stdout = [];
    process.argv = ['node', appdir + '/artisan'];

    var laraveldir = path.resolve(__dirname, '../data/laravel_fa');
    bddStdin('ini\t', '\n', '\t', laraveldir + '\t', '\n', '\n', ' \n');

    var unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt);
      // return '';
    });
    global.app = new shell({
      chdir: appdir + '/'
    });
    app.config = rewire('../../bootstrap/config')();
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
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.done();
    }

  }
}

