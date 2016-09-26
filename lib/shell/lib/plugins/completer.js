'use strict';
/* global app */
/*

Completer plugin
================

Provides tab completion. Options passed during creation are:

-   `shell`  , (required) A reference to your shell application.
*/

var rewire = require('rewire');
var readDir = rewire('readdir');
var path = require('path');
var each = require('lodash/each');
var fs = require('fs');

//hack for artisan and repl symlink
fs.stat = fs.lstat;
readDir.__set__('fs', fs);

var console;

module.exports = function completer(settings) {
  var shell;
  console = app.logger(app.config('core.log.prefix') + ':completer');
  shell = settings.shell;
  var prompt = function prompt(text, cb) {
    var command, route, routes, suggestions, _i, _len;
    suggestions = [];
    routes = shell.routes;
    for (_i = 0, _len = routes.length; _i < _len; _i++) {
      route = routes[_i];
      command = route.name;
      if (command.substr(0, text.length) === text && command !== '') {
        suggestions.push(command);
      }
    }
    return cb(false, [suggestions, text]);
  };

  var completPath = function completPath(text, cb) {
    var options, absolute;

    var strncmp = function strncmp(str1, str2, lgth) {
      if (lgth === 0) {
        return true;
      }
      var s1 = String(str1).substr(0, lgth);
      var s2 = String(str2).substr(0, lgth);
      if (s1 === s2) {
        return true;
      }
      return false;
    };

    var readPath = text;
    if ((/^\//).test(text)) {
      options = readDir.INCLUDE_DIRECTORIES + readDir.NON_RECURSIVE + readDir.ABSOLUTE_PATHS;
      absolute = true;
    } else {
      readPath = path.normalize(path.join(shell.settings.prompt_dir, '/' + text));
      absolute = false;
      options = readDir.INCLUDE_DIRECTORIES + readDir.NON_RECURSIVE;
    }

    if (!(/\/$/).test(readPath)) {
      readPath = path.dirname(readPath);
    }
    var suggestions = [];
    readDir.read(readPath, ['*/'], options, function readDirRead(err, files) {
      /* istanbul ignore if */
      if (err) {
        return cb(false, [
          suggestions, text
        ]);
      }
      if (files.length === 1) {
        suggestions.push('');
      }
      each(files, function eachFiles(file) {

        if (/^\./.test(file)) {
          return;
        }
        if (absolute) {
          file = file.replace(/\/\//, '/');
        } else {
          if (/\/$/.test(text)) {
            suggestions.push(file);
            return;
          }

          text = path.basename(text);
        }
        if (strncmp(file, text, text.length)) {
          if ((/\/$/).test(text)) {
            file = file.replace(text, '');
          }
          suggestions.push(file);
        }
      });
      if (suggestions.length === 1) {
        suggestions.push('');
      }
      console.log(suggestions);
      return cb(false, [
        suggestions, text
      ]);
    });

  };

  shell.interface().completer = function interfaceCompleter(text, cb) {
    switch (shell.settings.prompt_type) {
      case 'prompt':
        return prompt(text, cb);
      case 'path':
        return completPath(text, cb);
        /* istanbul ignore next */
      default:
        return cb(null, [
          [], text
        ]);
    }
  };
  return null;
};

