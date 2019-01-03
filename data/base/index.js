/* eslint global-require: 0 */
try {
  require('laravel-queue/bootstrap/app')();
} catch(e) {
    console.log(e.message);
}
