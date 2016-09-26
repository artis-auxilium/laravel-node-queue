'use strict';
/*

`routes.shellOnly`
==================

Ensure the current process is running in shell mode.
*/

module.exports = function shellOnly(req, res, next) {
  if (!req.shell.isShell) {
    res.red('Command may only be executed inside a running shell').ln();
    res.prompt();
    return;
  }
  return next();
};
