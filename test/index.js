'use strict';
/* eslint global-require: 0 */

module.exports = {
  'test history plugins': require('./lib/shell/plugins/testHistory'),
  'test help plugins': require('./lib/shell/plugins/testHelp'),
  'test router plugins':require('./lib/shell/plugins/testRouter'),
  'test middleware':require('./lib/shell/routes/testMiddlewares'),
  'test init': require('./Commands/testInit'),
  'test models creator': require('./Commands/testModelsCreator'),
  'test make command': require('./Commands/testMakeCommand'),
  'test init command': require('./bootstrap/testInitCommand'),
  'test init database': require('./bootstrap/testInitDatabase'),
  'test init config': require('./bootstrap/testInitConfig'),
  'test Missing Job': require('./Commands/testMissingJob'),
  'test send mail': require('./lib/testSendMail'),
  'test index':require('./bootstrap/testInitIndex'),
  'test laravel config': require('./Commands/testLaravelConfig')
};


