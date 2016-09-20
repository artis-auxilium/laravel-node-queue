'use strict';
/* global appdir */
module.exports = function compileMailCongif(conf) {
  return {
    transporter: {
      name: 'smtp',
      host: conf.host,
      port: conf.port,
      secure: false,
      ignoreTLS: true

    },
    from: conf.from.name + '<' + conf.from.address + '>',
    root: appdir
  };
}

