'use strict';
/*eslint no-magic-numbers: 0 */

var EventEmitter, Interface, Request, Response, shell, events, readline;

readline = require('readline');
events = require('events');
EventEmitter = events.EventEmitter;
var utils = require('../../utils');
var util = require('util');
var Styles = require('./Styles');
Request = require('./Request');
Response = require('./Response');
Interface = require('readline').Interface;
var console;

Interface.prototype.setPrompt = (function setPrompt(parent) {
  return function returnSetPrompt() {
    var args = Array.prototype.slice.call(arguments);
    if (!args[1]) {
      args[1] = Styles.unstyle(args[0]).length;
    }
    return parent.apply(this, args);
  };
})(Interface.prototype.setPrompt);

shell = (function exportShell(_super) {
  var Shell = function Shell(settings) {

    if (!(this instanceof Shell)) {
      return new Shell(settings);
    }
    EventEmitter.call(this);
    if (settings) {
      this.init(settings);
    }
    this.stack = [];

    return this;
  };

  util.inherits(Shell, _super);

  Shell.prototype.init = function init(settings) {
    var self = this;
    console = this.logger(this.config('core.log.prefix') + ':shell');

    this.tmp = {};
    this.settings = settings;
    this.set('config', this.config);
    if (!this.settings.prompt) {
      this.settings.prompt = '>> ';
    }
    if (!this.settings.stdin) {
      this.settings.stdin = process.stdin;
    }
    if (!this.settings.stdout) {
      this.settings.stdout = process.stdout;
    }

    if (!this.settings.env) {
      this.settings.env = this.config().env('NODE_ENV', 'development');
    }

    this.set('env', this.settings.env);

    this.styles = new Styles({
      stdout: this.settings.stdout
    });
    process.on('beforeExit', function beforeExit() {
      return self.emit('exit');
    });
    /* istanbul ignore next */
    process.on('uncaughtException', function processUncaughtException(error) {
      self.emit('exit', [error]);
      self.styles.red().ln();
      console.error('Internal error, closing...');
      console.error(error.message);
      console.error(error.stack);
      self.styles.white().ln();
      self.quit();
    });
    this.isShell = this.settings.isShell ? this.settings.isShell : process.argv.length < 3;
    if (this.isShell) {
      this.interface();
    }
    if (!settings.workspace) {
      settings.workspace = utils.workspace();
    }
    if (settings.chdir === true) {
      process.chdir(settings.workspace);
    }
    if (typeof settings.chdir === 'string') {
      process.chdir(settings.chdir);
    }
    console.log('init completed');
    this.initialized = true;
    return this;
  };

  Shell.prototype.start = function start() {
    if (!this.initialized) {
      throw new Error('app not initialized run Shell.init()');
    }
    console.debug('start app');
    var command, noPrompt;
    command = typeof this.settings.command === 'undefined' ? process.argv.slice(2).join(' ') : this.settings.command;
    this.set('command', command);
    if (this.isShell) {
      noPrompt = this.set('noPrompt');
      if (command) {
        return this.run(command);
      } else if (!noPrompt) {
        return this.prompt();
      }
    }
    if (command) {
      return this.run(command);
    }
    return this.run('');
  };

  Shell.prototype.interface = function shellInterface() {
    if (this._interface) {
      return this._interface;
    }
    this._interface = readline.createInterface(this.settings.stdin, this.settings.stdout);
    return this._interface;
  };

  Shell.prototype.configure = function shellConfigure(env, fn) {
    if (typeof env === 'function') {
      fn = env;
      env = 'all';
    }
    if (env === 'all' || env === this.settings.env) {
      fn.call(this);
    }
    return this;
  };

  Shell.prototype.use = function shellUse(handle) {
    if (handle) {
      this.stack.push({
        route: null,
        handle: handle
      });
    }
    return this;
  };

  Shell.prototype.cmds = {};

  Shell.prototype.run = function run(command) {
    var index, next, req, res, self;
    command = command.trim();
    this.set('current_command', command);
    this.emit('command', [command]);
    this.emit(command, []);
    self = this;
    req = new Request(this, command);
    res = new Response({
      shell: this,
      stdout: this.settings.stdout
    });
    index = 0;
    next = function runNext(err) {
      console.debug('run next');
      if (err) {
        //return res.prompt();
        console.log(err);

      }
      var arity, layer, text;
      layer = self.stack[index++];
      if (!layer) {
        if (err) {
          res.red(err.message).ln();
          if (self.config('app.debug')) {
            res.white(err.stack);
          }
          command = '';
          return res.prompt();
        }
        if (command !== '') {
          text = "No command found at " + command;
          if (err) {
            text += ": " + (err.message || err.name);
            console.log(err);
          }
          res.red(text);
        }
        return res.prompt();
      }
      arity = layer.handle.length;
      if (err) {
        if (arity === 4) {
          self.emit('error', err);
          return layer.handle(err, req, res, next);
        }
        return next(err);
      } else if (arity < 4) {
        return layer.handle(req, res, next);
      }
      return next();
    };
    return next();
  };

  Shell.prototype.set = function set(setting, val) {
    if (val) {
      console.debug('set', setting, 'to', val);
      this.settings[setting] = val;
      return this;
    }
    if (this.settings.hasOwnProperty(setting)) {
      return this.settings[setting];
    } else if (this.parent) {
      return this.parent.set(setting);
    }
    return this;
  };

  Shell.prototype.prompt = function prompt() {
    var text;

    if (this.isShell) {
      this.set('prompt_type', 'prompt');
      text = this.styles.raw(this.settings.prompt, {
        color: 'green'
      });
      return this.interface().question(text, this.run.bind(this));
    }
    console.debug('not in shell, exit...');
    this.styles.ln();
    return this.quit();

  };

  Shell.prototype.quit = function quit() {

    this.emit('quit');
    if (this.isShell) {
      this.styles.green('Good bye!');
    }
    this.styles.ln();
    this.interface().close();
    this.settings.stdin.destroy();
    console.debug('quit');
  };

  return Shell;

})(EventEmitter);

module.exports = shell;

