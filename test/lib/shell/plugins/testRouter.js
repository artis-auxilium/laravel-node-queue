'use strict';
/* global app,appdir*/

var rewire = require('rewire');
var BddStdin = require('../../../utils/bdd-stdin');
var shell = require('../../../../lib/shell');
var intercept = require('intercept-stdout');
var each = require('lodash/each');

var bddStdin;

module.exports = {
  'test router plugin with arg': function testRouterPluginWithArg(test) {
    rewire('../../../utils/bootstrap');
    var stdout = [];
    process.argv = ['node', appdir + '/artisan'];
    bddStdin = new BddStdin().type;
    bddStdin(
      'test:one --option 12\n',
      'test:one --option 12m\n',
      'test:second\n',
      'test:second notNeededArg otherparam\n',
      'test:third\n',
      'quit\n'
    );
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
    });
    app.cmd(
      'test:one {argument([0-9])=default:test} {2argument:deuxieme argument} {autre([w+])=pour} {--option:help}',
      'text help',
      function fakeFunction(req, res) {
        res.prompt();
      }
    );
    app.cmd('test:second {param?}', 'text help', function fakeFunction(req, res) {
      res.print('run test:second');
      res.prompt();
    });
    app.cmd('test:third {--option}', 'text help', function fakeFunction2() {
      throw new Error('error throwed in function');
    });
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        'Type "help" or press enter for a list of commands\n',
        'parameter 12m for argument not valid',
        'run test:second',
        'error throwed in function',
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

