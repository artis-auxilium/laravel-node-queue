'use strict';
var styles = require('./Styles');
var pad = require('pad');
var utils = require('../../utilsCmd');

var response = (function exportResponse(_super) {

  var Response = function Response(settings) {
    this.shell = settings.shell;
    Response.__super__.constructor.call(this, settings);
  }
  utils._extends(Response, _super);

  Response.prototype.pad = pad;

  Response.prototype.prompt = function prompt() {
    return this.shell.prompt();
  };

  return Response;

})(styles);

module.exports = response

