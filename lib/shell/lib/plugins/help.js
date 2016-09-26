'use strict';

var pad = require('pad');
var each = require('lodash/each');
var console;

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
  shell = settings.shell;
  console = shell.logger(shell.config('core.log.prefix') + ':shell:help');
  console.log('start helper');

  var introduction = 'Type "help" or press enter for a list of commands';
  var padding = 35;
  var argPadding = 20;
  var firstPad = 2;

  if (!settings.introduction) {
    settings.introduction = introduction;
  }
  shell.help = function shellHelp(req, res) {
    var routes = shell.routes;
    var command = req.params.command;
    if (command) {

      var route = routes[shell.routeName[command]];
      if (!route) {
        res.red('command ' + command + ' not found');
        return res.prompt();
      }
      res.yellow('Help:').ln();
      res.print(pad('', firstPad)).white(route.description).ln().ln();
      res.yellow('Usage:').ln();
      res.print(pad('', firstPad)).white(route.name);
      if (route.keys.options.length > 0) {
        res.white('[options] [--] ');
      }
      var args = '';
      each(route.keys.params, function eachParam(param) {
        var name = param.optional ? '[<' + param.key + '>]' : '<' + param.key + '>';

        args += pad('', firstPad) + pad('\x1b[32m' + param.key, argPadding);
        if (param.help) {
          args += '\x1b[37m' + param.help + ' ';
        }
        if (param.def) {
          args += '\x1b[33m[default: "' + param.def + '"]';
        }
        args += '\n';
        res.white(name + ' ');
      });

      res.ln().ln();
      if (route.keys.params.length > 0) {
        res.yellow('Arguments:').ln();
      }
      res.green(args).ln();
      if (route.keys.options.length > 0) {
        res.yellow('Options:').ln();
      }
      each(route.keys.options, function eachOption(option) {
        res.print(pad('', firstPad)).green(pad(option.key, argPadding));
        if (option.help) {
          res.white(option.help);
        }
        res.ln();
      });

      return res.prompt();
    }
    var routeText;
    res.yellow('Available commands:');
    res.ln();

    each(routes, function eachRoute(rte) {
      routeText = pad(rte.name, padding);
      if (rte.description) {
        res.print(pad('', firstPad)).green(routeText).white(rte.description).ln();
      }
    });
    return res.prompt();
  };
  console.log('add routes');
  shell.cmd('help {command(([\\w\\:])*)?}', 'Show this message', shell.help.bind(shell));
  shell.cmd('', shell.help.bind(shell));
  if (shell.isShell && settings.introduction) {
    text = typeof settings.introduction === 'string' ? settings.introduction : introduction;
    return shell.styles.println(text);
  }
};

