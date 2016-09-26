'use strict';
// fake bee-queue
// to avoid app waiting on make:job
var events = require('events');
var util = require('util');

var Queue = function Queue() {
  return this;
};

util.inherits(Queue, events.EventEmitter);

Queue.prototype.onMessage = function onMessage() {};

Queue.prototype.close = function close() {};

Queue.prototype.destroy = function destroy() {};

Queue.prototype.retries = function retries() {
  return this;
};

Queue.prototype.getJob = function getJob() {};

Queue.prototype.getNextJob = function getNextJob() {};

Queue.prototype.runJob = function runJob() {};

Queue.prototype.finishJob = function finishJob() {};

Queue.prototype.process = function process() {};

Queue.prototype.checkStalledJobs = function checkStalledJobs() {};

Queue.prototype.toKey = function toKey() {};

module.exports = Queue;

