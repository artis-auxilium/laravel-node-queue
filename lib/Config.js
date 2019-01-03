'use strict';

var include = require('include-all');
var fs = require('fs');
var dotenv = require('dotenv');
var console;

var Config = function Config(appdir, logger) {
  this.config = include({
    dirname: appdir + '/Config',
    filter: /(.+)\.js$/
  });
  const envConfig = dotenv.parse(fs.readFileSync(`${appdir}/.env`));
  Object.keys(envConfig).forEach(function eachKey(key) {
    this.set(key, envConfig[key]);
  }, this);
  console = logger(this.config.core.log.prefix + ':config');
  console.debug('config loaded');
  var self = this;

  return function getConfig(key, def) {
    if (!key) {
      return self;
    }
    return self.get(key, def);
  };
};

Config.prototype.get = function get(key, def) {
  var reduce = function reduce(obj, index) {
    if (!obj) {
      return null;
    }
    return obj[index];
  };
  var config = key.split('.').reduce(reduce, this.config);

  if (!config && typeof config !== 'boolean') {
    if (def instanceof Error) {
      throw def;
    }
    return def;
  }
  return config;
};

Config.prototype.set = function set(key, value) {
  var tags = key.split(".");
  var len = tags.length - 1;
  var obj = this.config;

  for (var index = 0; index < len; index++) {
    if (!obj[tags[index]]) {
      obj[tags[index]] = {};
    }
    obj = obj[tags[index]];

  }
  if (!value) {
    delete obj[tags[len]];
    return;
  }
  obj[tags[len]] = value;
};

Config.prototype.env = function getEnv(key, def) {
  var env = process.env[key];
  return env ? env : def;
};

module.exports = Config;

