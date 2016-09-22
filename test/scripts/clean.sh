#!/bin/bash
BASEDIR=$(realpath ./)
# find "${BASEDIR}/test/data/app_fake/Config/" -type f ! -regex ".*/\(laravel.js\|core.js\|.gitignore\)" -exec rm {} \;
find "${BASEDIR}/test/data/app_fake/Jobs/" -type f ! -regex ".*/\(laravel.js\|core.js\|.gitignore\)" -exec rm {} \;
find "${BASEDIR}/test/data/app_fake/Commands/" -type f ! -regex ".*/\(laravel.js\|core.js\|.gitignore\)" -exec rm {} \;