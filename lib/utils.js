'use strict';
/* eslint global-require: 0 */
var fs = require('fs');
var path = require('path');
var existsSync = fs.existsSync || path.existsSync;

module.exports = {
  workspace: function workspace() {
    var dir, dirs, _i, _len;
    if (process.env.PWD && existsSync(process.env.PWD)) {
      return process.env.PWD;
    }
    if (process.mainModule.paths) {
      dirs = process.mainModule.paths;
    } else {
      dirs = require('module')._nodeModulePaths(process.argv[1]);
    }

    for (_i = 0, _len = dirs.length; _i < _len; _i++) {
      dir = dirs[_i];

      if (/bin/.test(dir)) {
        dirs[_i + 1] = '/path/not/exist';
      }

      if (dir !== '/path/not/exist' && !/bin/.test(dir) &&
        (existsSync(dir) || existsSync(path.normalize(dir + '/../package.json')))
      ) {
        return path.normalize(dir + '/..');
      }
    }
  }
};

