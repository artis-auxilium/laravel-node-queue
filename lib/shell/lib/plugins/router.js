'use strict';
/*eslint no-unused-vars: ["error", { "args": "none" }]*/
var utils = require('../../../utilsCmd');
var each = require('lodash/each');

var querystring = {
  unescape: function unescape(str) {
    return decodeURIComponent(str);
  }
};

var normalize = function normalize(command, keys, sensitive) {
  command = command.concat('/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/\{(\w+)(\(.*\))?(\?)?\}/g, function formatCommand(match, key, format, optional) {
      keys.push(key);
      format = format || '([^\\s]+)';
      optional = optional || '+';
      return format + optional;
    }).replace(/([\/.])/g, '\\$1').replace(/\*/g, '(.+)').replace(/\s+/g, '\\s?');
  return new RegExp('^' + command + '$', sensitive ? 'i' : '');
};

var match = function match(req, routes) {
  var captures, index, key, keys, regexp, routeOk, val;
  each(routes, function eachRoutes(route, routeKey) {
    regexp = route.regexp;
    keys = route.keys;
    captures = regexp.exec(req.command);
    if (captures) {
      route.params = {};
      index = 0;
      captures.shift();
      each(captures, function eachCaptures(capture, keyCapture) {
        key = keys[keyCapture];
        val = typeof capture === 'string' ? querystring.unescape(capture) : capture;
        if (key) {
          route.params[key] = val;
        } else {
          route.params[String(index)] = val;
          index += 1;
        }
      });
      req._route_index = routeKey;
      routeOk = route;
      return route;
    }
  });
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
  var params, routes, shell;
  shell = settings.shell;
  if (!settings.sensitive) {
    settings.sensitive = true;
  }
  routes = shell.routes = [];
  params = {};
  shell.param = function shellParam(name, fn) {
    if (Array.isArray(name)) {
      name.forEach(function eachName(paramName) {
        return this.param(paramName, fn);
      }, this);
    } else {
      if (name[0] === ':') {
        name = name.substr(1);
      }
      params[name] = fn;
    }
    return this;
  };
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
    var args, keys, route;
    args = Array.prototype.slice.call(arguments);
    route = {};
    route.command = args.shift();
    if (typeof args[0] === 'string') {
      route.description = args.shift();
    }
    route.middlewares = utils.flatten(args);
    keys = [];
    route.regexp = normalize(route.command, keys, settings.sensitive);
    route.keys = keys;
    routes.push(route);
    return this;
  };
  shell.cmd('quit', 'Exit this shell', shell.quit.bind(shell));
  return function returnRouter(req, res, next) {
    var route = null;
    var pass = function pass() {
      var keys;
      route = match(req, routes);
      if (!route) {
        return next();
      }
      var index = 0;
      keys = route.keys;
      req.params = route.params;
      var param = function param(err) {
        var fn, key, val;
        try {
          key = keys[index++];
          val = req.params[key];
          fn = params[key];
          if (err === 'route') {
            return pass(req._route_index + 1);
          } else if (err) {
            return next(err);
          } else if (fn) {
            if (fn.length === 1) {
              req.params[key] = fn(val);
              return param();
            }
            return fn(req, res, param, val);

          } else if (!key) {
            index = 0;
            var nextMiddleware = function fnNextMiddleware(middlewareErr) {
              fn = route.middlewares[index++];
              if (middlewareErr === 'route') {
                return pass(req._route_index + 1);
              } else if (middlewareErr) {
                return next(middlewareErr);
              } else if (fn) {
                return fn(req, res, nextMiddleware);
              }
              return pass(req._route_index + 1);

            };
            return nextMiddleware();
          }
          return param();
        } catch (error) {
          return next(error);
        }
      };
      return param();
    };
    return pass();
  };
};

