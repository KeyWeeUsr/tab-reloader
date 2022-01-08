#!/bin/sh
zip -r -FS ../tab-reloader.zip * \
    --exclude '*.git*' \
    --exclude '*.sh' \
    --exclude '*~' \
    --exclude '.*' \
    --exclude '*#'
