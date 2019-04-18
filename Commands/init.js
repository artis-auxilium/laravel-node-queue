'use strict';
/* global app,appdir */

var fs = require('fs-promise');
var shelljs = require('shelljs');
var path = require('path');
var utils = require('../lib/utilsCmd');
var laravelPath;
var request;
var response;

var askLaravelFolder = function askLaravelFolder() {
  return new Promise(function promiseAskLaravelFolder(resolve) {
    request.question({
      name: 'path to laravel project:',
      value: '',
      type: 'path'
    }, function getpath(answer) {
      resolve(answer);
    });
  });
};

var checkArtisan = function checkArtisan(cmdRes) {
  return new Promise(function promiseCheckArtisan(resolve, reject) {
    var test = cmdRes.match(/\s*Laravel\s+Framework\s+(version)?\s*(.*)/);
    if (test) {
      resolve(test);
      return;
    }
    reject(new Error('not a laravel framework'));
  });
};

var askCommandFolder = function askCommandFolder() {
  return new Promise(function promiseAskCommandFolder(resolve) {
    request.question({
      name: 'path to commands folder:',
      value: 'app/Console/Commands/',
      type: 'path',
      base: laravelPath
    }, function getpath(answer) {
      var commandpath = path.resolve(laravelPath, answer);
      fs.stat(commandpath)
        .then(function fsStat() {
          resolve(answer);
        }).catch(function catchStatError(err) {
          if (err.code === 'ENOENT') {
            fs.mkdir(err.path)
              .then(function fsMkdir() {
                resolve(answer);
              })
              .catch(function catchMkdirError(newErr) {
                response.red(newErr);
              });
          }
        });

    });
  });
};
var cpCommand = function cpCommand(laravelCommandPath) {
  return new Promise(function promiseCpCommand(resolve, reject) {
    var here = __dirname;
    var commandPath = path.resolve(here, '../data/laravel/NodeConfig.php');
    fs.stat(laravelCommandPath).then(function fsStatCmdPath() {
      response.yellow('NodeConfig.php allready in your laravel project').ln();
      var message = 'maybe you need to add "\\App\\Console\\Commands\\NodeConfig::class" to ';
      message += path.normalize(path.dirname(laravelCommandPath) + '/../') + 'kernel.php';
      response.yellow(message).ln();
      return resolve();
    }).catch(function catchFsStatCmd() {
      try {
        var resCp = shelljs.cp(commandPath, laravelCommandPath);
        if (resCp.stderr) {
          return reject(resCp.stderr);
        }
      } catch (error) {
        return reject(error);
      }

      response.green('command copied to ' + laravelCommandPath).ln();
      var message = 'add "\\App\\Console\\Commands\\NodeConfig::class" to ';
      message += path.normalize(path.dirname(laravelCommandPath) + '/../') + 'kernel.php';
      response.yellow(message).ln();
      return resolve();
    });

  });
};

var writeConf = function writeConf() {
  return new Promise(function promiseWrite(resolve, reject) {
    var config = app.config('laravel');
    config.path = laravelPath;
    var data = JSON.stringify(config);
    var comment = "/**\n";
    comment += "* Laravel config\n";
    comment += "*\n";
    comment += "* path: path to laravel home (for run artisan command)\n";
    comment += "*\n";
    comment += "* config:\n";
    comment += "*     key: name of the config in laravel\n";
    comment += "*          import: - true import without ask\n";
    comment += "*                  - false don't import\n";
    comment += "*          asis: true same as laravel\n";
    comment += "*                false look for a file with the key name in lib/config folder\n";
    comment += "* addToApp : is added to app config file (jobs backup is here)\n";
    comment += "*/\n";
    fs.writeFile(appdir + '/Config/laravel.js', comment + utils.formatConfig(data))
      .then(function writeOk() {
        resolve();
      })
      .catch(reject);

  });

};

var cmd = function cmd(command) {
  return new Promise(function promiseCmd(resolve, reject) {
    shelljs.exec(command, {
      silent: true,
      async: true
    }, function commandOk(code, stdout, stderr) {
      if (stderr) {
        return reject(stderr);
      }
      return resolve(stdout);
    });

  });
};

module.exports = {
  pattern: 'init',
  help: 'Install all required tool needed and run initial imports',
  function: function handle(req, res) {
    request = req;
    response = res;

    askLaravelFolder()
      .then(function configureLavarel(result) {
        laravelPath = result;
        return cmd('php ' + result + '/artisan -V --no-ansi');
      })
      .then(function cmdExecuted(result) {
        return checkArtisan(result);
      })
      .then(function artisanChecked(result) {
        res.green('install command on laravel v' + result[2]).ln();
        return askCommandFolder();
      })
      .then(function commandFolderAsked(cmdPath) {
        var laravelCommandPath = path.resolve(laravelPath, cmdPath, 'NodeConfig.php');
        return cpCommand(laravelCommandPath);
      }).then(function filecopied() {
        return writeConf();
      }).then(function waitUserInput() {
        req.question('when done type enter', function tapeEnter() {
          req.shell.isShell = false;
          app.config().set('laravel.path', laravelPath);
          req.shell.run('laravel:config');
        });

      })

      .catch(function catchError(error) {
        utils.displayError(error, res);
      });

  }
};

