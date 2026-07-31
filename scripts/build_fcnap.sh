#!/usr/bin/env bash

set -e
set -o pipefail

export https_proxy=http://proxy.npm.baidu-int.com:8269/

corepack enable
corepack prepare yarn@4.13.0 --activate

echo "node $(node -v)"
echo "npm $(npm -v)"
echo "yarn $(yarn -v)"

if [ "$BUILD_CACHE_BUSTING" = "Y" ]; then
	rm -rf node_modules
fi

yarn install

NODE_ENV=production yarn run build

tree build

mv build output

tree output
