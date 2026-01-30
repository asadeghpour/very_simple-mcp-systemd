#!/bin/bash
npx tsc
cp dist/index.js ./index.js
mcp-cli chat --config-file server_config.json --provider ollama --model gpt-oss:20b
