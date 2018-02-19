'use strict';
/* global app,appdir*/
/* eslint global-require: 0*/

// var rewire = require('rewire');
var BddStdin = require('../../test/utils/bdd-stdin');
// var shell = require('../../lib/shell');
var intercept = require('intercept-stdout');

var bddStdin;

describe('Bootstrap command', () => {
  beforeEach(() => {
    bddStdin = new BddStdin().type;
  });
  test('test load bootstrap index', () => {
    var stdout = [];
    process.argv = ['node', appdir + '/artisan', 'help'];
    bddStdin('');
    var unhookIntercept = intercept(function onIntercept(txt) {
      stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
      // return '';
    });
    process.stdin.destroy = function stdinDestroy() {
      unhookIntercept();
      var toTest = [
        'Available commands:'
      ];
      toTest.forEach((value) => {
        expect(stdout.indexOf(value) > -1).toBeTruthy();

      });
    };
    require('../../bootstrap/commands');
  });
});

// module.exports = {
//   'test command not found': function testCommandNotFound(test) {

//     var stdout = [];
//     process.argv = ['node', appdir + '/artisan', 'command:notfound'];
//     bddStdin('');
//     var unhookIntercept = intercept(function onIntercept(txt) {
//       stdout.push(txt.replace(/\u001b\[.*?m/g, ''));
//       // return '';
//     });
//     rewire('../utils/bootstrap');
//     app.init({
//       chdir: appdir + '/'
//     });
//     app.configure(function configureApp() {
//       app.use(shell.router({
//         shell: app
//       }));
//     });
//     app.on('error', function appError() {
//       unhookIntercept();
//     });
//     process.stdin.destroy = function stdinDestroy() {
//       unhookIntercept();
//       test.ok(stdout.indexOf('No command found at command:notfound') > -1);
//       test.done();
//     };
//     app.start();
//   }

// };

