'use strict';
/*global logger,config,Sequelize,Models,appdir,db */
var console = logger(config.core.log.prefix + ':db');
global.Sequelize = require('sequelize');
var each = require('lodash/each');
var includeAll = require('include-all');

var setAssociation = function setAssociation(modelDef, modelName) {
  if (modelDef.associate !== null && typeof modelDef.associate === 'function') {
    modelDef.associate();
    console.debug('associate ' + modelName);
  }
};

if (typeof config.database !== "undefined") {
  if (config.database.connections.options.logging) {
    config.database.connections.options.logging = console.debug;
    console.log('query debug');
  }

  global.db = new Sequelize(
    config.database.connections.database,
    config.database.connections.username,
    config.database.connections.password,
    config.database.connections.options
  );

  global.Models = includeAll({
    dirname: appdir + '/Models',
    filter: /(.+)\.js$/
  });

  each(Models, function eachModels(modelDef, modelName) {
    global[modelName] = db.define(modelName, modelDef.attributes, modelDef.options);
    console.debug('define ' + modelName);
  });

  each(Models, setAssociation);
}

