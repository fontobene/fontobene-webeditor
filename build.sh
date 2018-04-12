#!/bin/sh
set -euo pipefail

if ! [ -x "$(command -v wasm-bindgen)" ]; then
    echo -e "wasm-bindgen not found. To install:\n"
    echo -e "    cargo install wasm-bindgen-cli\n"
    exit 1
fi

# Build the .wasm file using cargo / rust
cargo +nightly build --target wasm32-unknown-unknown

# Run the `wasm-bindgen` CLI tool
wasm-bindgen \
    target/wasm32-unknown-unknown/debug/fontobene_webeditor.wasm \
    --out-dir .

# Package everything up using webpack and start a dev server
npm install
npm run serve
