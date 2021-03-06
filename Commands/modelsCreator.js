'use strict';
/* global app */
/* eslint global-require: 0 */
var utils = require('../lib/utilsCmd');

module.exports = {
  pattern: 'make:models',
  help: 'Create model from database',
  function: function run(req, res) {
    if (app.config('core.modelsCreator.models').length === 0) {
      res.yellow('Please add models to import in Config/core.js').ln();
      res.prompt();
      return;
    }
    var dbModels = require('../lib/db-models');
    dbModels()
      .then(function allOk(result) {
        utils.displayMessage(result, res);
        res.prompt();

      }).catch(function catchError(error) {
        utils.displayError(error, res);
      });

  }
};

