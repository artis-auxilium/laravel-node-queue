'use strict';
Object.keys(require.cache).forEach(function eachRequireKey(key) {
  delete require.cache[key];
});

process.setMaxListeners(0);
var path = require('path');
global.appdir = path.resolve(__dirname, '../../data/base');

var jsdiff = require('diff');
var colors = require('colors');
var each = require('lodash/each');
var rewire = require('rewire');
rewire('../../bootstrap');

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

