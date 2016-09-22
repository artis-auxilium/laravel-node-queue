/**
 * queue:
 *   prefix:prefix used by bee-queue
 *   
 * log:
 *   prefix: debug-logger prefix
 *   
 * modelsCreator:
 *   models: models to import table name singularised and capitalized e.g.:table users = User
 *   modelsFolder : folder where exported models are write 
 *   define: default option for sequelise models
 *    
 * langs : i18n settings https://www.npmjs.com/package/i18n
 * 
 */
module.exports = {
  queue: {
    prefix: 'bq-test'
  },
  log: {
    prefix: 'laravel-queue'
  },
  modelsCreator: {
    models: ['User'],
    modelsFolder: 'Models',
    define: {}
  },
  langs: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    objectNotation: true,
    directory: appdir + '/resources/langs',
    register: global
  }
}

