'use strict';
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
  _extends: function extend(child, parent) {
    var __hasProp = {}.hasOwnProperty;
    for (var key in parent) {
      if (__hasProp.call(parent, key)) {
        child[key] = parent[key];
      }
    }

    var ctor = function ctor() {
      this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
  }
};

