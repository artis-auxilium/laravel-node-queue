'use strict';
/* global appdir,config,mailer */
// var console = require('debug-logger')('backworker:sendmail');
var Promise = require('bluebird');
var ECT = require('ect');
var defaults = require('lodash/defaults');
var nodemailer = require('nodemailer');
var renderer = ECT({
  root: appdir + '/resources/views/',
  ext: '.ect'
});

var Mail = function Mail(email, subject, data, template, options) {
  if (!config.mail) {
    throw new Error('mail not configured');
  }
  this.mailer = nodemailer.createTransport(config.mail.transporter);
  this.to = email;
  this.subject = subject;
  this.content = data;
  this.template = template;
  this.options = options;
};

Mail.prototype.send = function sendMail(callback) {
  var mailTemplate = 'emails/templates/' + this.template + '.ect';
  var html = renderer.render(mailTemplate, this.content);
  var mailOptions = {
    from: config.mail.from,
    to: this.to,
    subject: this.subject,
    html: html
  };
  if (this.options) {
    defaults(mailOptions, this.options);
  }

  return new Promise(function sendPromise(resolve, reject) {
    mailer.sendMail(mailOptions, function mailerSendMail(err, info) {
      if (err) {
        if (callback) {
          return callback(err);
        }
        return reject(err);
      }
      if (callback) {
        return callback(null, info);
      }
      resolve(info);
    });
  });
};
module.exports = Mail;
