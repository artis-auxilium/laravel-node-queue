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
    prefix: 'bq'
  },
  log: {
    prefix: 'laravel-queue'
  },
  modelsCreator: {
    models: [],
    modelsFolder: 'Models',
    define: {
      "paranoid": true,
      "timestamps": true,
      "createdAt": "created_at",
      "updatedAt": "updated_at",
      "deletedAt": "deleted_at"
    }
  },
  langs: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    objectNotation: true,
    directory: appdir + '/resources/langs',
    register: global
  }
}

