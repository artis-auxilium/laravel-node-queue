'use strict';
/*global app,Sequelize,appdir */

global.Sequelize = require('sequelize');
var console = app.logger(app.config('core.log.prefix') + ':db');
var each = require('lodash/each');
var includeAll = require('include-all');

var setAssociation = function setAssociation(modelDef, modelName) {
  /* istanbul ignore else*/
  if (modelDef.associate !== null && typeof modelDef.associate === 'function') {
    modelDef.associate();
    console.debug('associate ' + modelName);
  }
};

if (app.config('database')) {
  if (app.config('database.connections.options.logging')) {
    app.config().set('database.connections.options.logging', console.debug);
    console.log('query debug');
  }

  app.db = new Sequelize(
    app.config('database.connections')
  );

  app.models = includeAll({
    dirname: appdir + '/Models',
    filter: /(.+)\.js$/
  });

  each(app.models, function eachModels(modelDef, modelName) {
    global[modelName] = app.db.define(modelName, modelDef.attributes, modelDef.options);
    console.debug('define ' + modelName);
  });

  each(app.models, setAssociation);
}

