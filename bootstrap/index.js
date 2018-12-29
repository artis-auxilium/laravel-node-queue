'use strict';
/* global appdir,bug */
var raven = require('raven');
var defaults = require('lodash/defaults');
var Config = require('../lib/Config');
var Shell = require('../lib/shell');


var logger = Shell.prototype.logger = require('debug-logger');
Shell.prototype.config = new Config(appdir, logger);
let app = global.app = new Shell();
var logPrefix = app.config('core.log.prefix');
var console = app.logger(logPrefix + ':app');

app.logger.inspectOptions = {
  colors: true
};
/* istanbul ignore else*/
if (app.config('app.debug')) {
  process.env.DEBUG = logPrefix + ':*';
  console.log('set env.debug to ' + logPrefix + ':*');
}

app.trans = require('i18n');
var langConfig = app.config('core.langs');
var transLogger = app.logger(logPrefix + ':trans');
var defaultsLangConfig = {
  logDebugFn: transLogger.debug,
  logWarnFn: transLogger.warn,
  logErrorFn: transLogger.log
};

langConfig = defaults(langConfig, defaultsLangConfig);
app.trans.configure(langConfig);
// no need sentry in test
/* istanbul ignore if */
if (process.env.NODE_ENV !== "development" && app.config('services.raven', false)) {
  global.bug = new raven.Client(app.config('services.raven.dsn'));
  var consoleBug = app.logger(logPrefix + ':Sentry');

  bug.setTagsContext({
    Logger: "node"
  });
  bug.patchGlobal();
  bug.on('logged', function sentryLogged() {
    consoleBug.error('erreur détecté et envoyé a sentry');
  });
  bug.on('error', function sentryError() {
    consoleBug.error('Sentry is broke.');
  });
  consoleBug.log('Sentry configured');
} else {
  global.bug = false;
}
require('../lib/db');

