#!/usr/bin/env bash

set -e
set -o pipefail

export https_proxy=http://proxy.npm.baidu-int.com:8269/
export ROLLUP_USE_WASM=1

corepack enable
corepack prepare yarn@4.13.0 --activate

node --version
yarn --version

if [ "$BUILD_CACHE_BUSTING" = "Y" ]; then
	rm -rf node_modules
fi

# npm镜像服务小流量 @chenze03
wget -O - https://baidu-npm-sync.bj.bcebos.com/verdaccio/replace.sh | bash

yarn install

NODE_ENV=production yarn run build

tree build

mv build output

tree output
