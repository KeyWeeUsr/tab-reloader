#!/bin/sh
./node_modules/.bin/nyc \
    --reported=text \
    ./node_modules/mocha/bin/mocha \
    --parallel
