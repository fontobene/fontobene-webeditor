# FontoBene Webeditor

An experimental wasm viewer (first) and editor (later) for FontoBene fonts.

## Setup

    rustup target add wasm32-unknown-unknown --toolchain nightly
    cargo +nightly install wasm-bindgen-cli
    npm install
    npm run build-debug
    npm run serve
