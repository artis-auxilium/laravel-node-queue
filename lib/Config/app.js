'use strict';
/* global app*/
var each = require('lodash/each');
module.exports = function compileAppConfig(conf) {
  var notUsed = ['providers', 'aliases'];
  each(notUsed, function eachNotUsed(value) {
    delete conf[value];
  });

  each(app.config('laravel.addToApp'), function eachAddToApp(value, key) {
    conf[key] = value;
  });
  return conf;
};

