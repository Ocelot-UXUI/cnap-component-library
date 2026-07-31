#!/usr/bin/env bash

set -e
set -o pipefail

echo "Node version: $(node --version)"
echo "Yarn version: $(yarn --version)"

if [ "$BUILD_CACHE_BUSTING" = "Y" ]; then
    rm -rf node_modules
fi

yarn install

NODE_ENV=production yarn run build

echo "Build output:"
tree build

mv build output

echo "Final output:"
tree output
