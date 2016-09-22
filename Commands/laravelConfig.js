'use strict';
/* global app,appdir */
/* eslint global-require: 0 */
var Promise = require('bluebird');
var shelljs = require('shelljs');
var utils = require('../lib/utilsCmd');
var fs = require('fs-promise');
var includes = require('lodash/includes');
var each = require('lodash/each');
var include = require('include-all');
var tmp = require('tmp');
var request, tmpdir;
var toTransforms = [];

var prepareTmpFolder = function prepareTmpFolder() {
  return new Promise(function promisePrepareTmpFolder(resolve, reject) {
    tmp.dir({
      prefix: 'laravel_queue-',
      unsafeCleanup: true
    }, function tmpDirCallback(err, name) {
      if (err) {
        reject(err)
      }
      fs.mkdir(name + '/Config-laravel')
        .then(function tmpdirOk() {
          resolve(name + '/Config-laravel');
        });

    });
  });
}

var cmd = function cmd(command, dontParse) {
  return new Promise(function promiseCmd(resolve, reject) {
    shelljs.exec(command, {
      async: true,
      silent: true
    }, function commandOk(code, stdout, stderr) {
      if (stderr) {
        return reject(stderr);
      }
      if (dontParse) {
        return resolve(stdout);
      }
      try {
        return resolve(JSON.parse(stdout));

      } catch (error) {
        return reject(new Error(stdout.trim()));
      }
    });

  });
};

var getConfig = function getConfig(configs) {
  var questions = [];
  var laravelConfig = app.config.laravel.config;
  var laravelKeys = Object.keys(laravelConfig);
  var cleanAnswers = [];
  return new Promise(function promiseConfigs(resolve) {
    each(configs, function eachConfigs(conf) {
      if (!includes(laravelKeys, conf)) {
        questions.push({
          name: 'Create ' + conf + ' ?',
          value: ['Y', 'n']
        });
      } else if (laravelConfig[conf].import) {
        cleanAnswers[conf] = 'y';
      }

    });

    request.question(questions, function getAnswers(answers) {
      each(answers, function eachAnswers(answer, key) {
        var keyAnswer = key.replace('Create ', '');
        keyAnswer = keyAnswer.replace(' ?', '');
        if (typeof answer === 'object') {
          answer = 'y';
        }
        answer = answer.toLowerCase();
        cleanAnswers[keyAnswer] = answer;
      });
      return resolve(cleanAnswers);

    });
  });
};

var write = function write(conf) {
  var path = '';
  var message = null;
  return new Promise(function promiseWrite(resolve, reject) {
    cmd('php ' + app.config.laravel.path + '/artisan node:config ' + conf, true)
      .then(function commandOk(data) {
        if (!app.config.laravel.config[conf] || app.config.laravel.config[conf].asis) {
          path = appdir + '/Config';
          message = conf + ' created';
        } else {
          path = tmpdir;
          toTransforms.push(conf);
        }
        fs.writeFile(path + '/' + conf + '.js', utils.formatConfig(data))
          .then(function writeOk() {
            resolve(message);
          })
          .catch(reject);
      });

  });

};

var writeConfs = function writeConfs(confs) {
  var cmds = [];
  return new Promise(function promiseWriteConfs(resolve, reject) {
    for (var conf in confs) {
      if (confs[conf] === 'y') {
        cmds.push(write(conf));
      }
    }

    Promise.all(cmds)
      .then(function allWriteOk(result) {
        resolve(result);
      }).catch(function writeKo(err) {
        reject(err);
      });

  });

};

var nodeConfig = function nodeConfig() {
  var cmds = [];

  return new Promise(function promiseNodeConfig(resolve, reject) {
    var laravelConfig = include({
      dirname: tmpdir,
      filter: /(.+)\.js$/
    });
    var conf, loaded, error;

    each(toTransforms, function eachConfig(toTransform) {
      error = loaded = conf = null;
      try {
        conf = require(appdir + '/lib/Config/' + toTransform)(laravelConfig[toTransform]);
        loaded = true;
      } catch (errorAppload) {
        if (errorAppload.code) {
          error = new Error('cant find /lib/Config/' + toTransform + '.js');
        } else {
          error = errorAppload
        }
        loaded = false;
      }
      if (!loaded) {
        try {
          conf = require('../lib/Config/' + toTransform)(laravelConfig[toTransform]);
          loaded = true;
        } catch (errorCoreload) {
          if (errorCoreload.code) {
            error = new Error('cant find /lib/Config/' + toTransform + '.js');
          } else {
            error = errorCoreload
          }
          loaded = false;
        }
      }
      if (!loaded) {
        return reject(error);
      }
      var content = utils.formatConfig(conf);
      cmds.push(fs.writeFile(appdir + '/Config/' + toTransform + '.js', content));

    })

    Promise.all(cmds).then(function allWriteOk() {
      var result = [];
      each(toTransforms, function eachConfig(confWrited) {
        result.push(confWrited + ' created');
      });
      resolve(result);
    }).catch(function writeKo(err) {
      reject(err);
    });

  });

};

module.exports = {
  pattern: 'laravel-config',
  help: 'Get config from laravel',
  function: function run(req, res) {
    request = req;
    return prepareTmpFolder()
      .then(function folderPrepared(name) {
        tmpdir = name
        return cmd('php ' + app.config.laravel.path + '/artisan node:config')
      })
      .then(getConfig)
      .then(function questionAsked(answers) {
        var laravelKeys = Object.keys(app.config.laravel.config);
        var setting = {};
        var hasSetting = false;
        for (var key in answers) {
          if (!includes(laravelKeys, key)) {
            hasSetting = true;
            setting[key] = {};
            setting[key].import = answers[key] === 'y';
            if (setting[key].import) {
              setting[key].asis = true;
            }
          }
        }
        if (hasSetting) {
          res.yellow('add this to config in Config/laravel.js to save this responses').ln();
          res.yellow(utils.formatConfig(setting)).ln();
        }
        return writeConfs(answers)
      })
      .then(function displayConfCreated(result) {
        each(result, function eachResult(message) {
          if (message !== null) {
            res.green(message).ln();
          }
        });
      })
      .then(nodeConfig)
      .then(function allOk(result) {
        utils.displayMessage(result, res);
        res.prompt();
      })
      .catch(function catchError(error) {
        utils.displayError(error, res);
      });
  }
};

