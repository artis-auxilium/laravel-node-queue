#!/bin/bash
BASEDIR=$(realpath ./)
if [[ -e "${BASEDIR}/data/base/.test" ]];
then
    rm -r "${BASEDIR}/data/base/.test"
else
    mkdir "${BASEDIR}/data/base/.test"
fi
find "${BASEDIR}/data/base/Config/" -type f ! -regex ".*/\(laravel.js\|core.js\|.gitignore\)" -exec rm {} \;
find "${BASEDIR}/data/base/Jobs/" -type f ! -regex ".*/\(readme\)" -exec rm {} \;
find "${BASEDIR}/data/base/Commands/" -type f ! -regex ".*/\(readme\)" -exec rm {} \;
find "${BASEDIR}/data/base/resources/langs/" -type f ! -regex ".*/\(readme\)" -exec rm {} \;
rm -Rf "${BASEDIR}/data/base/ModelsNew"
rm -Rf "${BASEDIR}/test/data/laravel_fake/app/Console/Commands"
rm -f "${BASEDIR}/data/base/Models/User.js"
git checkout HEAD -- data/base/Config/laravel.js