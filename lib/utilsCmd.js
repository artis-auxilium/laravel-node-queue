'use strict';
/* global app,bug */
/* eslint no-invalid-this:0*/

var jsBeautify = require('js-beautify').js_beautify;
var each = require('lodash/each');

module.exports = {
  flatten: function flatten(arrayIn, ret) {
    if (typeof ret === 'undefined') {
      ret = [];
    }
    each(arrayIn, function eachArr(obj) {
      if (Array.isArray(obj)) {
        this.flatten(obj, ret);
      } else {
        ret.push(obj);
      }
    })
    return ret;
  },
  formatConfig: function formatConfig(config) {
    if (typeof config !== 'string') {
      config = JSON.stringify(config);
    }
    config = jsBeautify('module.exports =' + config + ';')
      .replace(/"([A-Za-z0-9_]*)":/g, "$1:")
      .replace(/\\\//g, '/');
    return config;
  },
  displayMessage: function displayMessage(result, res) {
    each(result, function eachMessage(message) {
      res.green(message).ln();
    });
  },
  displayError: function catchError(err, res) {
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
  }
};

