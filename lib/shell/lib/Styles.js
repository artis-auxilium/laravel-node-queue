'use strict';
var each = require('lodash/each');

var colors = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37
};

var bgcolors = {
  black: 40,
  red: 41,
  green: 42,
  yellow: 43,
  blue: 44,
  magenta: 45,
  cyan: 46,
  white: 47
};

var Styles = function Styles(settings) {
  if (!(this instanceof Styles)) {
    return new Styles(settings);
  }
  this.settings = settings;
  this.current = {
    weight: 'regular'
  };
  this.colors = colors;
  this.bgcolors = bgcolors;
  return this;
};

Styles.prototype.color = function fnColor(color, text) {
  this.print(text, {
    color: color
  });
  if (!text) {
    this.current.color = color;
  }
  return this;
};

var _fn = function _fn(color) {
  Styles.prototype[color] = function prototypeColor(text) {
    return this.color(color, text);
  };
  return Styles.prototype[color];
};
each(colors, function eachColors(code, color) {
  _fn(color);
});

Styles.prototype.nocolor = function nocolor(text) {
  return this.color(null, text);
};

Styles.prototype.bgcolor = function fnBgcolor(bgcolor) {
  if (!bgcolor) {
    bgcolor = 0;
  }
  this.print('\x1B[' + bgcolor + ';m39');
  return this;
};

Styles.prototype.weight = function fnWeight(weight, text) {
  this.print(text, {
    weight: weight
  });
  if (!text) {
    this.current.weight = weight;
  }
  return this;
};

Styles.prototype.bold = function bold(text) {
  return this.weight('bold', text);
};

Styles.prototype.regular = function regular(text) {
  return this.weight('regular', text);
};

Styles.prototype.print = function print(text, settings) {
  this.settings.stdout.write(this.raw(text, settings));
  return this;
};

Styles.prototype.println = function println(text) {
  this.settings.stdout.write(text + '\n');
  return this;
};

Styles.prototype.ln = function ln() {
  this.settings.stdout.write('\n');
  return this;
};

Styles.prototype.raw = function fnRaw(text, settings) {
  var raw;
  raw = '';
  if (!settings) {
    settings = {};
  }
  if (settings.color && (settings.color || this.current.color)) {
    raw += '\x1b[' + this.colors[settings.color || this.current.color] + 'm';
  } else {
    raw += '\x1b[39m';
  }
  var weight = settings.weight || this.current.weight;

  switch (weight) {
    case 'bold':
      raw += '\x1b[1m';
      break;
    case 'regular':
      raw += '\x1b[22m';
      break;
    default:
      throw new Error('Invalid weight "' + weight + '" (expect "bold" or "regular")');
  }

  if (text) {
    raw += text;
    if (this.current.color && this.current.color !== settings.color) {
      raw += this.raw(null, this.current.color);
    }
    if (this.current.weight && this.current.weight !== settings.weight) {
      raw += this.raw(null, this.current.weight);
    }
  }
  return raw;
};

Styles.prototype.reset = function reset() {
  return this.print(null, {
    color: null,
    weight: 'regular'
  });
};

Styles.unstyle = function unstyle(text) {
  return text.replace(/\x27.*?m/g, '');
};

module.exports = Styles;

