'use strict';
/* global db,config,appdir*/
var ModelExport = require('./lib/Model-export');
module.exports = function modelsCreator() {
  var options = config.core.modelsCreator;
  options.dir = appdir + '/' + options.modelsFolder;
  options.db = db;
  var modelExport = new ModelExport(options);
  return modelExport.createModels();

}

