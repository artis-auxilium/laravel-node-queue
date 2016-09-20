'use strict';
/* global app,config,appdir*/
var shell = require('../lib/shell');
var each = require('lodash/each');
var includeAll = require('include-all');
var path = require('path');
require('.');
global.app = new shell({
  chdir: appdir + '/'
});
app.config = config;
app.configure(function configureApp() {
  app.use(shell.history({
    shell: app
  }));
  app.use(shell.completer({
    shell: app
  }));
  app.use(shell.router({
    shell: app
  }));
  app.use(shell.help({
    shell: app,
    introduction: true
  }));
});
var eachCommands = function eachCommands(command) {
  app.cmd(command.pattern, command.help, command.function);
}

var commands = includeAll({
  dirname: path.normalize(path.join(__dirname, '/../Commands/')),
  filter: /(.+)\.js$/
});
each(commands, eachCommands);

var userCommands = includeAll({
  dirname: path.normalize(path.join(appdir, '/Commands/')),
  filter: /(.+)\.js$/
});
each(userCommands, eachCommands);

