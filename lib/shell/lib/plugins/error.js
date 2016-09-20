'use strict';
var each = require('lodash/each');

module.exports = function exportError(settings) {
  var shell;
  if (!settings.shell) {
    throw new Error('No shell provided');
  }
  shell = settings.shell;
  shell.on('error', function onError() {});
  return function returnError(err, req, res) {
    if (err.message) {
      res.red(err.message).ln();
    }
    if (err.stack) {
      res.red(err.stack).ln();
    }
    each(err, function eachError(error, key) {
      if (key === 'message') {
        return;
      }
      if (key === 'stack') {
        return;
      }
      if (typeof error === 'function') {
        return;
      }
      res.magenta(key).white(': ').red(error).ln();
    })
    return res.prompt();
  };
};

