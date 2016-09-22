'use strict';
var pad;

pad = require('pad');

/*

Help Plugin
-----------

Display help when the user types "help" or runs commands without arguments.
Command help is only displayed if a description was provided during the
command registration. Additionnaly, a new `shell.help()` function is made available.
Options passed during creation are:

-   `shell`        , (required) A reference to your shell application.
-   `introduction` , Print message 'Type "help" or press enter for a list of commands'
                      if boolean `true`, or a custom message if a `string`

Usage

  app = shell()
  app.configure ->
    app.use shell.router shell: app
    app.use shell.help
      shell: app
      introduction: true
*/

module.exports = function help(settings) {
  var shell, text;
  var introduction = 'Type "help" or press enter for a list of commands';
  var padding = 35;
  shell = settings.shell;
  shell.help = function shellHelp(req, res) {
    var route, routes, routeText, _i, _len;
    res.cyan('Available commands:');
    res.ln();
    routes = shell.routes;
    for (_i = 0, _len = routes.length; _i < _len; _i++) {
      route = routes[_i];
      routeText = pad(route.command.replace(':', ''), padding);
      if (route.description) {
        res.cyan(routeText).white(route.description).ln();
      }
    }
    return res.prompt();
  };
  shell.cmd('help', 'Show this message', shell.help.bind(shell));
  shell.cmd('', shell.help.bind(shell));
  if (shell.isShell && settings.introduction) {
    text = typeof settings.introduction === 'string' ? settings.introduction : introduction;
    return shell.styles.println(text);
  }
};

