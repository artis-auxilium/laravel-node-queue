'use strict';
/* global appdir */
var include = require('include-all');
module.exports = function config() {
  return include({
    dirname: appdir + '/Config',
    filter: /(.+)\.js$/
  });
}

