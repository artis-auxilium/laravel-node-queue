#!/bin/bash
BASEDIR=$(realpath ./)
find "${BASEDIR}/data/base/Config/" -type f ! -regex ".*/\(laravel.js\|core.js\|.gitignore\)" -exec rm {} \;
find "${BASEDIR}/data/base/Jobs/" -type f ! -regex ".*/\(readme\)" -exec rm {} \;
find "${BASEDIR}/data/base/Commands/" -type f ! -regex ".*/\(readme\)" -exec rm {} \;
find "${BASEDIR}/data/base/resources/langs/" -type f ! -regex ".*/\(readme\)" -exec rm {} \;
rm -Rf "${BASEDIR}/data/base/ModelsNew"
rm -f "${BASEDIR}/data/base/Models/User.js"