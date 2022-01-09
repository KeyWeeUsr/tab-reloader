#!/bin/sh
mkdir build ||true
zip -r -FS ./build/tab-reloader-$(git rev-parse --short HEAD).zip * \
    --exclude '*.git*' \
    --exclude '*.sh' \
    --exclude '*~' \
    --exclude '.*' \
    --exclude '*#' \
    --exclude '*LICENSE*' \
    --exclude '*license*' \
    --exclude '*node_modules*' \
    --exclude 'package-lock.json' \
    --exclude 'package.json' \
    --exclude .nyc_output \
    --exclude 'test*' \
    --exclude 'build/*'
