'use strict';
/* global app,appdir*/
/* eslint global-require: 0 */

var rewire = require('rewire');
var bddStdin = require('../lib/bdd-stdin');
var shell = require('../../lib/shell');
var missingJob = require('../../Commands/missingJob');
var intercept = require('intercept-stdout');

module.exports = {
  'test Missing Job': function testMissingJob(test) {
    var stdout = [];
    process.argv = ['node', appdir + '/artisan', 'make:job'];
    bddStdin('');
    var unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
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
    });
    app.on('error', function appError() {
      unhookIntercept();
    });
    app.cmd(missingJob.pattern, missingJob.help, missingJob.function);
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      test.ok(stdout.indexOf('example created') > -1);
      test.done();
    }
  }

}

