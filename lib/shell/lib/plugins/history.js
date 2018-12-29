'use strict';
var fs = require('fs');
var crypto = require('crypto');
var Interface = require('readline').Interface;
var hash = function hash(value) {
  return crypto.createHash('md5').update(value).digest('hex');
};

/*

History plugin
==============

Persistent command history over multiple sessions. Options passed during creation are:

-   `shell`  , (required) A reference to your shell application.
-   `name`   , Identify your project history file, default to the hash of the executed file
-   `dir`    , Location of the history files, defaults to `"#{process.env['HOME']}/.node_shell"`
*/

module.exports = function history(settings) {
  var file, json, stream, shell;
  /* istanbul ignore else*/
  shell = settings.shell;
  if (!shell.isShell) {
    return;
  }
  if (!settings.dir) {
    settings.dir = String(shell.config().env('HOME')) + "/.node_shell";
  }
  if (!settings.name) {
    settings.name = hash(process.argv[1]);
  }
  file = String(settings.dir) + "/" + settings.name;
  if (!fs.existsSync(settings.dir)) {
    fs.mkdirSync(settings.dir);
  }
  if (fs.existsSync(file)) {
    try {
      json = fs.readFileSync(file, 'utf8') || '[]';
      shell.interface().history = JSON.parse(json);
    } catch (error) {
      shell.styles.red('Corrupted history file').ln();
    }
  }
  stream = fs.createWriteStream(file, {
    flag: 'w'
  });
  Interface.prototype._addHistory = (function addHistory(parent) {
    return function returnHistory() {
      var buffer;
      if (this.history.length) {
        buffer = new Buffer(JSON.stringify(this.history));
        fs.write(stream.fd, buffer, 0, buffer.length, 0, () => {});
      }
      return parent.apply(this, arguments);
    };
  })(Interface.prototype._addHistory);
  return;
};

