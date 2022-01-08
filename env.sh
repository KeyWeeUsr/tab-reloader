#!/bin/sh
docker run \
    --interactive \
    --tty \
    --volume $(pwd):/app \
    --user 1000:1000 \
    --entrypoint /bin/bash \
    --workdir /app \
    node:current-slim $*
