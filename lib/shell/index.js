'use strict';
// Core
var Shell = module.exports = require('./lib/Shell');
Shell.styles = require('./lib/Styles');

// Plugins
Shell.completer = require('./lib/plugins/completer');
Shell.help = require('./lib/plugins/help');
Shell.history = require('./lib/plugins/history');
Shell.router = require('./lib/plugins/router');

// Routes
var confirm = require('./lib/routes/confirm');
var shellOnly = require('./lib/routes/shellOnly');
Shell.routes = {
  confirm: confirm,
  shellOnly: shellOnly
};

