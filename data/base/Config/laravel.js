/**
 * Laravel config
 *
 * path: path to laravel home (for run artisan command)
 *
 * config:
 *     key: name of the config in laravel
 *          inport: - true import without ask 
 *                  - false don't import
 *          asis: true same as laravel
 *                false look for a file with the key name in lib/config folder
 * addToApp : is added to app config file (jobs backup is here)
 */
module.exports = {
  "path": "/path/to/laravel",
  "config": {
    "app": {
      "import": true,
      "asis": false
    },
    "auth": {
      "import": true,
      "asis": true
    },
    "broadcasting": {
      "import": true,
      "asis": true
    },
    "cache": {
      "import": false
    },
    "compile": {
      "import": false
    },
    "database": {
      "import": true,
      "asis": false
    },
    "filesystems": {
      "import": true,
      "asis": true
    },
    "mail": {
      "import": true,
      "asis": false
    },
    "queue": {
      "import": true,
      "asis": true
    },
    "service": {
      "import": true,
      "asis": true
    },
    "session": {
      "import": false
    },
    "view": {
      "import": false
    },
    "services": {
      "import": true,
      "asis": true
    }
  },
  "addToApp": {}
};

