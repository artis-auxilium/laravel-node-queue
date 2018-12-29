'use strict';
/* global app,appdir,Promise */

global.Queue = require('../lib/queue');
var jsBeautify = require('js-beautify').js_beautify;
var fs = require('fs-promise');
var each = require('lodash/each');
var merge = require('merge');
var utils = require('../lib/utilsCmd');
var includeAll = require('include-all');
var noJob = [];
var Job, console;

var getNoJob = function getNoJob(jobs) {
  console.debug('collect job not created');
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
  console.debug('Update laravel config');
  return new Promise(function sauvConf(resolve, reject) {
    var laravelConfig = app.config('laravel');
    laravelConfig.addToApp.job = merge.recursive(true, laravelConfig.addToApp.job, app.config('app.job'));
    fs.writeFile(appdir + '/Config/laravel.js', utils.formatConfig(laravelConfig))
      .then(function sauvOk() {
        console.debug('config updated');
        resolve('config updated');
      })
      .catch(reject);

  });

};

var createJob = function createJob(jobName) {
  var jobFile = '/* global app,Queue,bug */\n';
  jobFile += "var queue = new Queue('" + jobName + "',app.queueOption);\n";
  jobFile += "var console = app.logger('" + app.config('core.log.prefix') + ":" + jobName + "');\n";
  jobFile += "var reportResult = function reportResult (jobId, result) {\n";
  jobFile += "if (result){\n";
  jobFile += "console.info('Result " + jobName + ": ', result);\n";
  jobFile += "}else{\n";
  jobFile += "console.log('job " + jobName + " '+jobId+' finished');\n}\n};\n";
  jobFile += "var retrying = function retrying (jobId, err) {\n";
  jobFile += "console.error('Job " + jobName + " ' + jobId + ' failed with error ' + err.message + '";
  jobFile += "but is being retried!');\n";
  jobFile += "};\n";
  jobFile += "var failed = function failed (jobId, err) {\n";
  jobFile += "console.error('Job " + jobName + " ' + jobId + ' failed with error ' + err.message);\n";
  jobFile += "bug.captureException(err);\n};\n\n";
  jobFile += "//queue.checkStalledJobs(5000, function(err) {\n";
  jobFile += "//console.log('Checked stalled jobs for " + jobName + "'); // prints every 5000 ms\n";
  jobFile += "//if (err) {\n";
  jobFile += "//console.log(err);\n//}\n//});\n\n";
  jobFile += "queue.on('ready', function ready() {\n";
  jobFile += "queue.process(function process(job, done) {\n";
  jobFile += "console.info('Processing job " + jobName + " ' + job.id);\n";
  jobFile += "//on error\n";
  jobFile += "// return done({\n";
  jobFile += "//message: 'failed'\n//});\n";
  jobFile += "done(null,'default job,need to change');\n";
  jobFile += "});\n";
  jobFile += "queue.on('job succeeded', reportResult);\n";
  jobFile += "queue.on('job retrying', retrying);\n";
  jobFile += "queue.on('job failed', failed);\n});\n";
  jobFile += "var add = function add(options) {\n";
  jobFile += "return queue.createJob(options).retries(3).save();\n};\n\n";
  jobFile += "module.exports.add = add;\n";

  return new Promise(function writeJob(resolve, reject) {
    console.debug('write job ', jobName);
    fs.writeFile(appdir + '/Jobs/' + jobName + '.js', jsBeautify(jobFile))
      .then(function jobCreated() {
        resolve(jobName + ' created');
      }).catch(reject);
  });

};

module.exports = {
  pattern: 'make:job {jobName?}',
  help: 'Make missing job',
  function: function run(req, res) {
    console = app.logger(app.config('core.log.prefix') + ':makeJob');
    if (!app.config('app')) {
      res.red('app config missing').ln();
      res.yellow('see manual for setup config from laravel').ln();
      res.prompt();
      return;
    }
    if (Object.keys(app.config('app.job', [])).length === 0) {
      res.yellow('no job in Config/app.js').ln();
      res.prompt();
      return;
    }
    global.queueOption = {};
    Job = includeAll({
      dirname: appdir + '/Jobs',
      filter: /(.+)\.js$/
    });
    var toWrite = [];

    updateLaravelConf()
      .then(function collectJob() {
        getNoJob(app.config('app.job'));
        each(noJob, function eachNoJOb(job) {
          toWrite.push(createJob(job));
        });
        return toWrite;
      }).then(function writeJobs(write) {
        Promise.all(write).then(function allWriteOk(result) {
          console.debug('All write ok');
          utils.displayMessage(result, res);
          res.prompt();
          // res.prompt();
        });
      }).catch(function catchError(error) {
        utils.displayError(error, res);
      });

  }
};

