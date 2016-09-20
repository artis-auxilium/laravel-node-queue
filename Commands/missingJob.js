'use strict';
/* global config,appdir,Promise */
global.Queue = require('bee-queue');
var jsBeautify = require('js-beautify').js_beautify;
var fs = require('fs-promise');
var each = require('lodash/each');
var merge = require('merge');
var utils = require('../lib/utilsCmd');
var includeAll = require('include-all');
var noJob = [];
var Job;

var getNoJob = function getNoJob(jobs) {
  each(jobs, function eachJob(job) {
    if (typeof job !== 'string') {
      getNoJob(job);
    }
    if (typeof job === 'string' && !Job[job]) {
      noJob.push(job);
    }
  });
};

var updateLaravelConf = function updateLaravelConf() {
  return new Promise(function sauvConf(resolve, reject) {
    var laravelConfig = config.laravel;
    laravelConfig.addToApp.job = merge.recursive(true, laravelConfig.addToApp.job, config.app.job);
    fs.writeFile(appdir + '/Config/laravel.js', utils.formatConfig(laravelConfig))
      .then(function sauvOk() {
        resolve('config updated');
      })
      .catch(reject);

  });

};

var createJob = function createJob(jobName) {
  var jobFile = "var queue = new Queue('" + jobName + "',queueOption);\n";
  jobFile += "var console = logger('" + config.core.log.prefix + ":" + jobName + "');\n";
  jobFile += "var reportResult = function(jobId, result) {\n";
  jobFile += "if (result){\n";
  jobFile += "console.info('Result " + jobName + ": ' + result);\n";
  jobFile += "}else{\n";
  jobFile += "console.log('job " + jobName + " '+jobId+' finished');\n}\n};\n";
  jobFile += "var retrying = function(jobId, err) {\n";
  jobFile += "console.error('Job " + jobName + " ' + jobId + ' failed with error ' + err.message + '";
  jobFile += "but is being retried!');\n";
  jobFile += "};\n";
  jobFile += "var failed = function(jobId, err) {\n";
  jobFile += "console.error('Job " + jobName + " ' + jobId + ' failed with error ' + err.message);\n";
  jobFile += "bug.captureException(err);\n};\n\n";
  jobFile += "//queue.checkStalledJobs(5000, function(err) {\n";
  jobFile += "//console.log('Checked stalled jobs for " + jobName + "'); // prints every 5000 ms\n";
  jobFile += "//if (err) {\n";
  jobFile += "//console.log(err);\n//}\n//});\n\n";
  jobFile += "queue.on('ready', function() {\n";
  jobFile += "queue.process(function(job, done) {\n";
  jobFile += "console.info('Processing job " + jobName + " ' + job.id);\n";
  jobFile += "//on error\n";
  jobFile += "// return done({\n";
  jobFile += "//message: 'failed'\n//});\n";
  jobFile += "done(null,'default job,need to change');\n";
  jobFile += "});\n";
  jobFile += "queue.on('job succeeded', reportResult);\n";
  jobFile += "queue.on('job retrying', retrying);\n";
  jobFile += "queue.on('job failed', failed);\n});\n";
  jobFile += "var add = function(options) {\n";
  jobFile += "return queue.createJob(options).retries(3).save();\n};\n\n";
  jobFile += "module.exports.add = add;\n";

  return new Promise(function writeJob(resolve, reject) {
    fs.writeFile(appdir + '/Jobs/' + jobName + '.js', jsBeautify(jobFile))
      .then(function jobCreated() {
        resolve(jobName + ' created');
      }).catch(reject);
  });

};

module.exports = {
  pattern: 'missing-job',
  help: 'make missing job',
  function: function run(req, res) {
    if (!config.app) {
      res.red('app config missing').ln();
      res.yellow('see manual for setup config from laravel').ln();
      return res.prompt();
    }
    if (Object.keys(config.app.job).length === 0) {
      res.yellow('no job in Config/app.js');
      return res.prompt();
    }
    global.queueOption = {};
    Job = includeAll({
      dirname: appdir + '/Jobs',
      filter: /(.+)\.js$/
    });
    var toWrite = [];

    updateLaravelConf()
      .then(function collectJob() {
        getNoJob(config.app.job);
        each(noJob, function eachNoJOb(job) {
          toWrite.push(createJob(job));
        });
        return toWrite;
      }).then(function writeJobs(write) {
        Promise.all(write).then(function allWriteOk(result) {
          utils.displayMessage(result, res);
          res.prompt();
        });
      }).catch(function allWriteKo(err) {
        console.log(err);
        console.trace(err);
        res.prompt();
      });

  }
};

