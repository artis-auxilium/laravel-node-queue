'use strict';
module.exports = function compileDatabaseConfig(db) {
  var conf = {};
  conf.connections = db.connections[db.default];
  conf.connections.adapter = db.default;
  conf.connections.options = {
    logging: false
  };
  conf.redis = db.redis.default;
  return conf;
}

