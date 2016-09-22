'use strict';
/* global app,appdir,Promise,bug */

var jsBeautify = require('js-beautify').js_beautify;
var fs = require('fs-promise');

var createCommand = function createCommand(cmdName) {
  return new Promise(function promiseCreateCommand(resolve, reject) {
    var cmdFile = "module.exports = {\n";
    cmdFile += "pattern: '" + cmdName + " :argument',\n";
    cmdFile += "help: 'text help in shell',\n";
    cmdFile += "function: function(req, res, next) {\n";
    cmdFile += "res.green().println(req.params.argument);\n";
    cmdFile += "res.prompt();\n";
    cmdFile += "}\n";
    cmdFile += "};\n";
    fs.writeFile(appdir + '/Commands/' + cmdName + '.js', jsBeautify(cmdFile))
      .then(function commandWriteOk() {
        resolve(cmdName + ' created');
      })
      .catch(function writeErr(err) {
        reject(err)
      });
  });
};

module.exports = {
  pattern: 'make-command :command_name',
  help: 'Make a commande file',
  function: function run(req, res) {
    createCommand(req.params.command_name)
      .then(function createCommandOk(result) {
        res.green(result);
        res.prompt();

      })
      .catch(function catchError(err) {
        res.red(err.message).ln();
        /* istanbul ignore if*/
        if (typeof app.config.app !== "undefined" && app.config.app.debug) {
          res.red(err.stack.replace(err.message, ''));
        }
        /* istanbul ignore if*/
        if (bug) {
          bug.captureException(err);
        }
        res.prompt();
      });
  }
};

