'use strict';
var Styles = require('./Styles');
var pad = require('pad');

class Response extends Styles {
  constructor(settings) {
    super(settings);
    this.shell = settings.shell;
  }

  prompt() {
    return this.shell.prompt();
  }
}

Response.prototype.pad = pad;


module.exports = Response;

