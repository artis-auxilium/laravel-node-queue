'use strict';
/* global app */
/* eslint new-cap: 0*/
var Promise = require('bluebird');
var console = app.logger(app.config('core.log.prefix') + ':model-export');
var _ = require('lodash');
_.mixin(require('lodash-inflection'));
var fs = require('fs');
var types = require('../config/datatypes').types;
var jsBeautify = require('js-beautify').js_beautify;

var ModelExport = function ModelExport(options) {
  var sequelize;
  this.opts = options;
  this.dir = options.dir;
  this.modelsToExport = options.models;
  this.sequelize = sequelize = options.db;
  if (!sequelize) {
    throw new Error('database not configured');
  }
  this.opts.database = sequelize.config.database;
  this.queryInterface = sequelize.getQueryInterface().QueryGenerator;
  this.models = {};
  this.associate = {};
};

ModelExport.prototype.createOutputDir = function createOutputDir() {
  var self = this;
  return new Promise(function PromiseCreateOutputDir(resolve) {
    fs.stat(self.dir, function statDir(err, stats) {
      if (err || !stats.isDirectory()) {
        return fs.mkdir(self.dir, function mkdir(mkdirErr) {
          if (!mkdirErr) {
            return resolve(true);
          }
        });
      }
      return resolve(true);
    });
  });
};

ModelExport.prototype.showAllTables = function showAllTables() {
  var self = this;
  return new Promise(function promiseShowAllTables(resolve, reject) {
    self.sequelize.showAllSchemas().then(function pluckTables(tables) {
      resolve(_.map(tables, "Tables_in_" + self.opts.database));
    }).catch(function catchAllTablesError(error) {
      reject(error);
    });
  });

};

ModelExport.prototype.describeOneTable = function describeOneTable(table) {
  var oneTable;
  var self = this;
  oneTable = {};
  return this.sequelize.query(this.queryInterface.describeTableQuery(table), {})
    .then(function ReturnOneTable(fields) {
      oneTable[table] = fields[0];
      self.models[table] = fields[0];
      return oneTable;
    });
};

ModelExport.prototype.describeAllTables = function describeAllTables() {
  var self = this;
  return new Promise(function promiseDescribeAlltables(resolve, reject) {
    self.showAllTables().then(function showAllTablesRes(tables) {
      if (tables.message) {
        reject(tables);
      }
      var promises;
      promises = [];
      _(tables).each(function eachTables(table) {
        return promises.push(self.describeOneTable(table));
      });
      return Promise.all(promises).then(function allTablesdescribe() {
        return resolve(self.models);
      });
    }).catch(function showAllTablesError(error) {
      reject(error);
    });
  });
};

ModelExport.prototype.createModels = function createModels() {
  var createOutputDirPromise, describeAllTablesPromise;
  var self = this;
  var lowerName, modelName;
  return new Promise(function promiseCreateModels(resolve, reject) {
    createOutputDirPromise = self.createOutputDir();
    describeAllTablesPromise = self.describeAllTables();
    Promise.all([createOutputDirPromise, describeAllTablesPromise])
      .then(function CreateDirAndDescribeOk(results) {
        var generatePromises, tables;
        tables = Object.keys(results[1]);
        generatePromises = [];
        tables.forEach(function eachTables(table) {
          lowerName = _(table).singularize();
          modelName = _(lowerName).capitalize();
          if (self.modelsToExport.indexOf(modelName) < 0) {
            return;
          }
          //for future association
          self.associate[lowerName] = modelName;
          return generatePromises.push(self.generateTemps({
            tableName: table,
            modelName: modelName,
            fields: results[1][table]
          }));
        });
        return Promise.all(generatePromises).then(function allCreated(messages) {
          self.sequelize.close();
          if (messages.length) {
            messages.push('all models are generated from db');
          } else {
            messages.push('nothing to do');
          }
          return resolve(messages);
        });
      }).catch(function CreateDirAndDescribeError(error) {
        self.sequelize.close();
        reject(error);
      });
  });

};

ModelExport.prototype.generateTemps = function generateTemps(data) {
  var define, text;
  if (data === null) {
    data = {};
  }
  var defaultDefine = this.opts.define;
  text = '/* global Sequelize */';
  text += "'use strict;'";
  text += "module.exports = {\nattributes: {\n";
  _.each(data.fields, function eachFields(field, key) {
    var allowNull, autoIncrement, lastString, primaryKey, typeOutStr;
    define = defaultDefine;
    allowNull = field.Null !== 'NO';
    if (field.Extra === 'auto_increment') {
      autoIncrement = true;
    } else {
      autoIncrement = false;
    }
    if (field.Key === 'PRI') {
      primaryKey = true;
    } else {
      primaryKey = false;
    }
    typeOutStr = '';
    _.each(types, function eachTypes(type) {
      var length;
      lastString = '';
      if (field.Type.match(type.name)) {
        if (type.value === 'not supported') {
          field.isSupported = false;
          return;
        }
        field.isSupported = true;
        typeOutStr = 'Sequelize.' + type.value;
        if (type.value === 'INTEGER') {
          length = field.Type.match(/\(\d+\)/);
          typeOutStr += length ? length : '';
          if (field.Type.match('unsigned')) {
            typeOutStr += '.UNSIGNED';
            return;
          }
        }

        if (type.value === 'ENUM') {
          var match = field.Type.match(/(set|enum)\((.*)\)/);
          typeOutStr += "(";
          if (match[1] === 'set') {
            typeOutStr += "'',";
          }
          typeOutStr += match[2];
          typeOutStr += ")";
        }
        if (field.Type === 'timestamp') {
          field.Default = function returnDefault() {
            return 'Sequelize.NOW';
          };
        }
        if (type.value === 'GEOMETRY') {
          typeOutStr += '(\'' + field.Type.toUpperCase() + '\')';
          return;
        }
      }
    });
    if (!field.isSupported) {
      console.log(field.Type, 'not supported');
      return;
    }
    if (field.Field === 'updated_at' || field.Field === 'created_at') {
      define.timestamps = true;
      define.createdAt = 'created_at';
      define.updatedAt = 'updated_at';
      field.Default = function returnDefault() {
        return 'Sequelize.NOW';
      };
    }
    text += field.Field + ": {\ntype: " + typeOutStr + ",\nallowNull: " + allowNull + ",\n";
    if (autoIncrement) {
      text += "autoIncrement: " + autoIncrement + ",\n";
    }
    if (primaryKey) {
      text += "primaryKey: " + primaryKey + ",\n";
    }
    if (typeof field.Default === 'string') {
      text += "defaultValue: \'" + field.Default + "\'\n}";
    } else if (typeof field.Default === 'function') {
      text += "defaultValue: " + field.Default() + "\n}";
    } else {
      text += "defaultValue: " + field.Default + "\n}";
    }
    if (key !== data.fields.length - 1) {
      lastString = ',';
    }
    text += lastString + "\n";

    if (field.Field === 'deleted_at') {
      define.paranoid = true;
      define.deletedAt = 'deleted_at';
    }
    return;

  });
  text += "},";
  text += "\nassociate: function associate () {\n/*" + data.modelName + ".hasOne(Children, {";
  text += "\nforeignKey:  'children_id'\n });";
  text += "\n" + data.modelName + ".addScope('children',{\ninclude: [{\nmodel:Children\n}]\n});*/";
  text += "\n},";
  text += "\noptions: {\ntableName: \'" + data.tableName + "\',\n";
  _.each(define, function eachDefine(value, opt) {
    if (typeof value === "boolean") {
      text += String(opt) + ": " + value + ",\n";
    } else {
      text += String(opt) + ": \'" + value + "\',\n";
    }
  });
  text += "classMethods: {},\ninstanceMethods: {},\nhooks: {},\n";
  text += "/*defaultScope: {\nwhere: {\nactive: true\n}\n},*/\n}\n};";
  var self = this;
  return new Promise(function promiseWrite(resolve, reject) {
    fs.writeFile(self.dir + "/" + data.modelName + ".js", jsBeautify(text), function writeOk(err) {
      if (err) {
        return reject("create " + data.modelName + " fail");
      }
      return resolve(data.modelName + " is created");
    });
  });

};

module.exports = ModelExport;

