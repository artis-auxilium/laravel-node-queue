'use strict';
var styles = require('./Styles');
var pad = require('pad');
var util = require('util');
var response = (function exportResponse(_super) {

  var Response = function Response(settings) {
    this.shell = settings.shell;
    Response.super_.call(this, settings);
  }
  util.inherits(Response, _super);

  Response.prototype.pad = pad;

  Response.prototype.prompt = function prompt() {
    return this.shell.prompt();
  };

  return Response;

})(styles);

module.exports = response

