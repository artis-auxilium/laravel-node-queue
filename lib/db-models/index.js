'use strict';
/* global app,appdir */
var ModelExport = require('./lib/Model-export');
module.exports = function modelsCreator() {
  var options = app.config('core.modelsCreator');
  options.dir = appdir + '/' + options.modelsFolder;
  options.db = app.db;
  var modelExport = new ModelExport(options);
  return modelExport.createModels();

};

