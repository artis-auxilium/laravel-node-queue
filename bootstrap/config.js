'use strict';

/* global appdir,logger */
var include = require('include-all');
module.exports = function exportConfig() {
  var config = include({
    dirname: appdir + '/Config',
    filter: /(.+)\.js$/
  });
  var console = logger(config.core.log.prefix + ':config');
  console.debug('config loaded');
  return config;
}

