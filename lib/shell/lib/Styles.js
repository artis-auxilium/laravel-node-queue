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

class Styles {
  constructor(settings) {
    // if (!(this instanceof Styles)) {
    //   return new Styles(settings);
    // }
    this.settings = settings;
    this.current = {
      weight: 'regular'
    };
    this.colors = colors;
    this.bgcolors = bgcolors;
  }
  color(color, text) {
    this.print(text, {
      color: color
    });
    if (!text) {
      this.current.color = color;
    }
    return this;
  }
  nocolor(text) {
    return this.color(null, text);
  }
  bgcolor(bgcolor) {
    if (!bgcolor) {
      bgcolor = 0;
    }
    this.print('\x1B[' + bgcolor + ';m39');
    return this;
  }
  weight(weight, text) {
    this.print(text, {
      weight: weight
    });
    if (!text) {
      this.current.weight = weight;
    }
    return this;
  }
  bold(text) {
    return this.weight('bold', text);
  }
  regular(text) {
    return this.weight('regular', text);
  }
  print(text, settings) {
    this.settings.stdout.write(this.raw(text, settings));
    return this;
  }
  println(text) {
    this.settings.stdout.write(text + '\n');
    return this;
  }
  ln() {
    this.settings.stdout.write('\n');
    return this;
  }
  raw(text, settings) {
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
  }
  reset() {
    return this.print(null, {
      color: null,
      weight: 'regular'
    });
  }
  static unstyle(text) {
    return text.replace(/\x27.*?m/g, '');
  }
}


var _fn = function _fn(color) {
  Styles.prototype[color] = function prototypeColor(text) {
    return this.color(color, text);
  };
  return Styles.prototype[color];
};
each(colors, function eachColors(code, color) {
  _fn(color);
});


module.exports = Styles;

