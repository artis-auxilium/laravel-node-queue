'use strict';
// Core
var Shell = module.exports = require('./lib/Shell');
Shell.styles = require('./lib/Styles');

// Plugins
Shell.completer = require('./lib/plugins/completer');
Shell.help = require('./lib/plugins/help');
Shell.history = require('./lib/plugins/history');
Shell.router = require('./lib/plugins/router');

// Middlewares
var confirm = require('./lib/routes/confirm');
var shellOnly = require('./lib/routes/shellOnly');
var timeout = require('./lib/routes/timeout');
Shell.routes = {
  confirm: confirm,
  shellOnly: shellOnly,
  timeout: timeout
};

