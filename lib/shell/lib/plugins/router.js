'use strict';

var utils = require('../../../utilsCmd');
var each = require('lodash/each');
var clone = require('lodash/clone');

var console;

var normalize = function normalize(command, route, sensitive) {
  command = command.concat('/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/\{(?:([\w\-]+)(?:\((.*?)\))?(?:\=(\w+))?(\?)?(?:\:([\w\s\']+))?)\}\s?/g,
      function formatCommand(match, key, format, def, optional, help) {
        if ((/^\-{2}/).test(key)) {
          route.keys.options.push({
            key: key,
            regex: format + optional,
            help: help
          });
          return '';
        }
        format = format || '(^\\w+)';
        optional = optional || '+';
        route.keys.params.push({
          key: key,
          regex: format + optional,
          def: def,
          optional: optional !== '+' || typeof def !== 'undefined',
          help: help
        });
        return '';

      });
  route.name = command.replace('/?', '');
  command = command.replace(/([\/.])/g, '\\$1').replace(/\*/g, '(.+)').replace(/\s+/g, '\\s?(.*)');
  return new RegExp('^' + command + '$', sensitive ? 'i' : '');
};

var match = function match(req, routes) {
  var captures, key, keys, regexp, routeOk, val;
  each(routes, function eachRoutes(route, routeKey) {

    regexp = route.regexp;
    keys = clone(route.keys.params);
    captures = regexp.exec(req.command);
    console.debug('test', '"' + req.command + '"', 'match', "'" + regexp + "'");
    if (captures) {
      console.debug('routes found', '\nroute:', route);
      route.params = {};

      //remove command
      captures.shift();
      //get arg
      route.options = [];
      var args = keys.length > 0 ? captures.shift().split(' ') : [];
      var keyArg = 0;
      var param;
      each(args, function eachCaptures(arg) {
        if ((/^\-\-/).test(arg)) {
          arg = arg.replace('--', '');
          route.options[arg] = true;
          return;
        }
        if (keyArg >= keys.length) {
          return;
        }
        param = keys.shift();
        key = param.key;
        val = typeof arg === 'string' ? decodeURIComponent(arg) : arg;
        var regex = new RegExp('^' + param.regex + '$');
        var valid = regex.exec(val);
        if (!valid) {
          console.debug('invalid parameter', regex, val);
          throw new Error('parameter ' + val + ' for ' + key + ' not valid');
        }
        keyArg += 1;
        if (val === '') {
          return;
        }
        route.params[key] = val;

      });
      req._route_index = routeKey;
      // throw new Error('missing parameter');
      routeOk = route;
      return false;
    }
  });
  // console.debug('routes:',routes);
  return routeOk;
};

/**
 * Module to find command to run.
 *
 * @module shell/plugins/router
 * @param  {Object} settings - Setting of router.
 * @returns {void} Return void.
 */
module.exports = function router(settings) {
  var routes, shell;
  shell = settings.shell;
  console = shell.logger(shell.config('core.log.prefix') + ':shell:router');
  shell.routeName = [];
  var routeIndex = 0;
  if (typeof settings.sensitive === 'undefined') {
    settings.sensitive = true;
  }
  routes = shell.routes = [];

  /**
   * Add route to shell.
   *
   * @function cmd
   * @param  {string}   command - Command format example: "command_name :required_arg :optional_arg?".
   * @param  {string=}  description - Text show in help.
   * @param  {...function} middleware - Function to run.
   * @returns {Shell} - Return this shell.
   */
  shell.cmd = function shellCmd() {
    var args, route;
    args = Array.prototype.slice.call(arguments);
    if (!args[0]) {
      return;
    }
    route = {};
    route.command = args.shift();
    if (typeof args[0] === 'string') {
      route.description = args.shift();
    }
    route.middlewares = utils.flatten(args);
    route.keys = {};
    route.keys.options = [];
    route.keys.params = [];
    route.regexp = normalize(route.command, route, settings.sensitive);
    routes.push(route);
    shell.routeName[route.name.trim()] = routeIndex;
    routeIndex += 1;
    return this;
  };
  shell.cmd('quit', 'Exit this shell', shell.quit.bind(shell));
  return function returnRouter(req, res, next) {
    var route = null;
    var pass = function pass() {
      try {
        route = match(req, routes);
      } catch (error) {
        return next(error);
      }

      if (!route) {
        return next();
      }
      var index = 0;
      req.params = route.params;
      req.options = route.options;
      req.config = shell.set('config');
      var param = function param() {
        var fn;
        try {
          index = 0;
          var nextMiddleware = function fnNextMiddleware(middlewareErr) {
            console.log('next middleware');
            fn = route.middlewares[index++];
            if (fn) {
              return fn(req, res, nextMiddleware);
            }
            console.log('no function to run');
            return next(middlewareErr);
          };
          return nextMiddleware();

        } catch (error) {
          console.log(error);
          return next(error);
        }
      };
      return param();
    };
    return pass();
  };
};

