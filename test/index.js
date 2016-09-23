'use strict';
/* eslint global-require: 0 */
var path = require('path');
var jsdiff = require('diff');
var colors = require('colors');
global.appdir = path.resolve(__dirname, '../data/base');
var each = require('lodash/each');
require('../bootstrap');
process.setMaxListeners(0);

module.exports = {
  'test history plugins': require('./shell/plugins/testHistory'),
  'test help plugins': require('./shell/plugins/testHelp'),
  'test init': require('./Commands/testInit'),
  'test models creator': require('./Commands/testModelsCreator'),
  'test make command': require('./Commands/testMakeCommand'),
  'test init database': require('./bootstrap/testInitDatabase'),
  'test Missing Job': require('./Commands/testMissingJob'),
  'test send mail': require('./lib/testSendMail'),
  'test index':require('./bootstrap/testInitIndex')
}

global.getDiff = function getDiff(base, other) {
  if (!base || !other) {
    return '';
  }
  if (typeof base === 'object') {
    var txtObj = '';
    each(base, function eachBase(value, key) {
      if (value !== other[key]) {
        console.log('if', 'value:', value, 'other[key]:', other[key]);
        txtObj += getDiff(value, other[key]) + '\n';
      }
    });
    return txtObj;
  }
  var diffTxt = '';
  var diff = jsdiff.diffChars(base, other);
  var isDiff = false;

  diff.forEach(function eachDiff(part) {
    // green for additions, red for deletions
    // grey for common parts
    var txt;
    if (part.added) {
      txt = colors.green(part.value);
      isDiff = true;
    } else if (part.removed) {
      txt = part.value.red;
      isDiff = true;
    } else {
      txt = part.value.grey;
    }
    diffTxt += txt;
  });
  if (!isDiff) {
    return '';
  }
  return diffTxt;
};

