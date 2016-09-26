'use strict';
/* global app,appdir*/

var each = require('lodash/each');
var includeAll = require('include-all');
var path = require('path');
var utils = require('../lib/utils');
var Shell = require('../lib/shell');

global.appdir = utils.workspace();

global.app = new Shell();
require('.');
app.init({
  chdir: appdir + '/'
});

app.configure(function configureApp() {
  app.use(Shell.history({
    shell: app
  }));
  app.use(Shell.completer({
    shell: app
  }));
  app.use(Shell.router({
    shell: app
  }));
  app.use(Shell.help({
    shell: app,
    introduction: true
  }));
});
var eachCommands = function eachCommands(command) {
  app.cmd(command.pattern, command.help, command.function);
};

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
app.start();

