'use strict';
/* eslint no-extra-parens:0*/
var each = require('each');

var exportRequest = (function exportRequest() {

  var Request = function Request(shell, command) {
    this.shell = shell;
    this.command = command;
  };

  var cleanAnswer = function cleanAnswer(answer) {
    if (answer.substr(-1, 1) === '\n') {
      answer = answer.substr(0, answer.length - 1);
    }
    return answer;
  };

  /*
    Ask one or more questions
  */

  Request.prototype.question = function question(questions, callback) {
    var answers, isObject, multiple, questionStr;
    var self = this;
    isObject = function fnIsObject(value) {
      return typeof value === 'object' && !Array.isArray(value);
    };
    multiple = true;
    answers = {};
    if (isObject(questions)) {
      questions = [questions];
      multiple = false;
    } else if (typeof questions === 'string') {
      multiple = false;
      questions = [{
        name: questions,
        value: ''
      }];
    }

    return each(questions).call(function eachQuestions(questionToAsk, key, next) {
      questionStr = String(questionToAsk.name) + " ";
      if (questionToAsk.value && questionToAsk.value !== '') {
        questionStr += "[" + questionToAsk.value + "] ";
      }
      self.shell.set('prompt_type', questionToAsk.type || 'none');
      self.shell.set('prompt_dir', questionToAsk.base || self.shell.settings.chdir);

      return self.shell.interface().question(questionStr, function askQuestion(answer) {
        answer = cleanAnswer(answer);
        answers[questionToAsk.name] = answer === '' ? questionToAsk.value : answer;
        return next();
      });
    }).then(function questionsAsked() {
      if (!multiple) {
        answers = answers[questions[0].name];
      }
      return callback(answers);
    });
  };

  /*
    Ask a question expecting a boolean answer
  */

  Request.prototype.confirm = function confirm(msg, defaultTrue, callback) {
    var self = this;
    var args = arguments;
    if (!callback) {
      callback = defaultTrue;
      defaultTrue = true;
    }
    if (!this.shell.settings.key_true) {
      this.shell.settings.key_true = 'y';
    }
    if (!this.shell.settings.key_false) {
      this.shell.settings.key_false = 'n';
    }
    var keyTrue = this.shell.settings.key_true.toLowerCase();
    var keyFalse = this.shell.settings.key_false.toLowerCase();
    var keyTrueStr = defaultTrue ? keyTrue.toUpperCase() : keyTrue;
    var keyFalseStr = defaultTrue ? keyFalse : keyFalse.toUpperCase();
    msg += ' ';
    msg += "[" + keyTrueStr + keyFalseStr + "] ";
    var question = this.shell.styles.raw(msg, {
      color: 'green'
    });
    return this.shell.interface().question(question, function askConfirm(answer) {
      var accepted, valid;
      accepted = ['', keyTrue, keyFalse];
      answer = cleanAnswer(answer);
      answer = answer.toLowerCase();
      valid = accepted.indexOf(answer) !== -1;
      if (!valid) {
        return self.confirm.apply(self, args);
      }
      return callback(answer === keyTrue || (defaultTrue && answer === ''));
    });
  };

  return Request;

})();

module.exports = exportRequest;

