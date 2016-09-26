'use strict';
/* global appdir,app */
// var console = app.logger(config('core.log.prefix') + ':mail');

var Promise = require('bluebird');
var ect = require('ect');
var defaults = require('lodash/defaults');
var nodemailer = require('nodemailer');
var error = new Error('mail not configured');
/**
 * @constructor
 * @class
 * @classdesc send email compiled with ECT via {@link https://github.com/nodemailer/nodemailer|nodemailer}
 * @param {string} email    email to send to
 * @param {string} subject  email subject
 * @param {Object} data     data to pass to ECT
 * @param {string} template template relative to resources/views/templates
 * @param {Object} options  option added to mail
 * see {@link https://github.com/nodemailer/nodemailer#e-mail-message-fields|nodemailer email message fields}
 * @example
 * var Mail = require('laravel-queue/lib/Mail');
 * var mail = new Mail('email@example.com', 'subject',{}, 'example');
 * mail.send()
 *     .then(function mailSuccess(res) {
 *       // mail send succeffuly
 *     }).catch(function mailError() {
 *       // mail not send
 *     });
 */
var Mail = function Mail(email, subject, data, template, options) {
  if (!app.config('mail')) {
    throw new Error('mail not configured');
  }
  this.mailer = nodemailer.createTransport(app.config('mail.transporter', error));
  this.renderer = ect({
    root: appdir + '/resources/views/',
    ext: '.ect'
  });
  this.to = email;
  this.subject = subject;
  this.content = data;
  this.template = template;
  this.options = options;
};
/**
 * send email
 * @param  {Function=} callback callback called when send
 * @return {Promise}  Bluebird promise
 */
Mail.prototype.send = function sendMail(callback) {
  var self = this;
  return new Promise(function sendPromise(resolve, reject) {
    var mailTemplate = 'templates/' + self.template + '.ect';
    var html = self.renderer.render(mailTemplate, self.content);
    var mailOptions = {
      from: app.config('mail.from', error),
      to: self.to,
      subject: self.subject,
      html: html
    };
    if (self.options) {
      defaults(mailOptions, self.options);
    }
    self.mailer.sendMail(mailOptions, function mailerSendMail(err, info) {
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

