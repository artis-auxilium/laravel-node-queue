'use strict';
/* global app,getDiff,appdir */
/* eslint no-magic-numbers:0 */

var rewire = require('rewire');
var Mail = rewire('../../lib/Mail');
var ect = require('ect');

var testRenderer;

module.exports = {
  setUp: function setUp(callback) {
    rewire('../utils/bootstrap');
    testRenderer = ect({
      root: appdir + '/resources/views/',
      ext: '.ect'
    });
    callback();
  },
  tearDown: function tearDown(callback) {
    callback();
  },
  'test SendMail Ok': function testSendMailOk(test) {
    test.expect(3);
    var email = 'test@exemple.com';
    var dataMail = {};
    var mailTemplate = 'templates/example.ect';
    var html = testRenderer.render(mailTemplate, dataMail);
    var mailer = {
      sendMail: function sendMail(opt, cb) {
        test.equal(html, opt.html, 'render not equal');
        test.equal(email, opt.to, 'email not match');
        return cb(null, 'ok');
      }
    };
    var nodemailer = {
      createTransport: function createTransport() {
        return mailer;
      }
    };

    Mail.__set__({
      nodemailer: nodemailer
    });
    var mail = new Mail(email, 'test subject', dataMail, 'example');
    mail.send()
      .then(function mailSuccess(res) {
        test.equal(res, 'ok');
        test.done();
      }).catch(function mailError() {
        test.done();
      });

  },
  'test SendMAil Error': function testSendMAilError(test) {
    test.expect(3);
    var email = 'test@exemple.com';
    var dataMail = {};
    var mailTemplate = 'templates/example.ect';
    var html = testRenderer.render(mailTemplate, dataMail);
    var mailer = {
      sendMail: function sendMail(opt, cb) {
        test.equal(html, opt.html, 'render not equal');
        test.equal(email, opt.to, 'email not match');
        return cb(new Error('pas ok'));
      }
    };
    var nodemailer = {
      createTransport: function createTransport() {
        return mailer;
      }
    };

    Mail.__set__({
      nodemailer: nodemailer
    });
    var mail = new Mail(email, 'test subject', dataMail, 'example');
    mail.send()
      .then(function mailSuccess() {
        test.done();
      }).catch(function mailError(error) {
        test.equal(error.message, 'pas ok');
        test.done();
      });

  },
  'test SendMail Callback ok': function testSendMailOkCallback(test) {
    test.expect(3);
    var email = 'test@exemple.com';
    var dataMail = {};
    var mailTemplate = 'templates/example.ect';
    var html = testRenderer.render(mailTemplate, dataMail);
    var mailer = {
      sendMail: function sendMail(opt, cb) {
        test.equal(html, opt.html, 'render not equal');
        test.equal(email, opt.to, 'email not match');
        return cb(null, 'ok');
      }
    };
    var nodemailer = {
      createTransport: function createTransport() {
        return mailer;
      }
    };

    Mail.__set__({
      nodemailer: nodemailer
    });
    var mail = new Mail(email, 'test subject', dataMail, 'example');
    mail.send(function mailSend(err, info) {
      if (err) {
        test.ok(false, 'no error');
      }
      test.equal(info, 'ok', 'info not equal');
      test.done();
    });

  },
  'test SendMAil Error Callback': function testSendMAilErrorCallback(test) {
    test.expect(3);
    var email = 'test@exemple.com';
    var dataMail = {};

    var mailTemplate = 'templates/example.ect';
    var html = testRenderer.render(mailTemplate, dataMail);
    var mailer = {
      sendMail: function sendMail(opt, cb) {
        test.equal(html, opt.html, 'render not equal' + getDiff(html, opt.html));
        test.equal(email, opt.to, 'email not match');
        return cb(new Error('pas ok'));
      }
    };

    var nodemailer = {
      createTransport: function createTransport() {
        return mailer;
      }
    };

    Mail.__set__({
      nodemailer: nodemailer
    });
    var mail = new Mail(email, 'test subject', dataMail, 'example');
    mail.send(function mailSend(err) {

      test.deepEqual(new Error('pas ok'), err, 'error not equal');
      test.done();
    });
  },
  'test SendMail Option Ok': function testSendMailOptionOk(test) {
    test.expect(3);
    var email = 'test@exemple.com';
    var dataMail = {};
    var options = {
      attachments: [{
        filename: 'text1.txt',
        content: 'hello world!'
      }]
    };
    var mailTemplate = 'templates/example.ect';
    var html = testRenderer.render(mailTemplate, dataMail);
    var mailer = {
      sendMail: function sendMail(opt, cb) {
        test.equal(html, opt.html, 'render not equal');
        test.equal(email, opt.to, 'email not match');
        test.equal(options.attachments, opt.attachments, 'option not match');
        return cb(null, 'ok');
      }
    };
    var nodemailer = {
      createTransport: function createTransport() {
        return mailer;
      }
    };

    Mail.__set__({
      nodemailer: nodemailer
    });
    var mail = new Mail(email, 'test subject', dataMail, 'example', options);
    mail.send()
      .then(function mailSuccess() {
        test.done();
      }).catch(function mailError() {
        test.done();
      });

  },
  'test SendMail No Config': function testSendMailNoConfig(test) {
    test.expect(1);
    app.config().set('mail', {});
    var mail;
    test.throws(function throwMailError() {
      mail = new Mail();
    }, Error, 'no mail configured');
    test.done(mail);

  }
};

