'use strict';
/*eslint no-undef: 0*/
var utils = require('../lib/utils');
var raven = require('raven');
global.logger = require('debug-logger');
/* istanbul ignore if */
if (!global.appdir) {
  global.appdir = utils.workspace();
}
global.config = require('./config')();
var console = logger(config.core.log.prefix + ':app');

logger.inspectOptions = {
  colors: true
};
/* istanbul ignore else*/
if (config.app && config.app.debug) {
  process.env.DEBUG = config.core.log.prefix + '*';
  console.log('set env.debug to ' + config.core.log.prefix + '*');
}

global.i18n = require('i18n');
i18n.configure(config.core.langs);
// no need sentry in test
/* istanbul ignore if */
if (process.env.NODE_ENV !== "development" &&
  typeof config.services !== "undefined" &&
  typeof config.services.raven !== "undefined"
) {
  var consoleBug = logger(config.core.log.prefix + ':Sentry');
  global.bug = new raven.Client(config.services.raven.dsn);
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
require('./database.js');

