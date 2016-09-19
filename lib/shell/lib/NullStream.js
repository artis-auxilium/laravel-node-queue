'use strict';
var utilsCmd = require('../../utilsCmd');
var events = require('events');

var nullStream = (function exportNullStream(_super) {

  var NullStream = function NullStream() {
    return NullStream.__super__.constructor.apply(this, arguments);
  }

  utilsCmd._extends(NullStream, _super);

  NullStream.prototype.readable = true;

  NullStream.prototype.pause = function pause() {};

  NullStream.prototype.resume = function resume() {};

  NullStream.prototype.pipe = function pipe() {};

  NullStream.prototype.writable = true;

  NullStream.prototype.write = function write(data) {
    return this.emit('data', data);
  };

  NullStream.prototype.end = function end() {
    return this.emit('close');
  };

  NullStream.prototype.destroy = function destroy() {};

  NullStream.prototype.destroySoon = function destroySoon() {};

  return NullStream;

})(events.EventEmitter);

module.exports = nullStream;

