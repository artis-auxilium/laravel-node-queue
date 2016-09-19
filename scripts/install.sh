#!/bin/bash
MODULE_DIR=$(pwd)
BIN_DIR="${MODULE_DIR}/bin"
PROJECT_DIR=$(realpath ../..)
if [ -d "${PROJECT_DIR}/Config" ]; then
    echo "app allready installed"
    exit 0
fi
cp -Rf "${MODULE_DIR}"/data/base/* "${PROJECT_DIR}"
ln -sf "${BIN_DIR}"/artisan "${PROJECT_DIR}"/artisan
ln -sf "${BIN_DIR}"/repl "${PROJECT_DIR}"/repl


