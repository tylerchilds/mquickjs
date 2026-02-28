#!/bin/sh

echo "=== as2: node ==="
cat tests/test.saga | node plan4/as2.js

echo ""
echo "=== as2: deno ==="
cat tests/test.saga | deno run plan4/as2.js

echo ""
echo "=== as2: mqjs ==="
awk 'BEGIN{printf "globalThis.__saga=\""} {gsub(/\\/, "\\\\"); gsub(/"/, "\\\""); printf "%s\\n", $0} END{printf "\";\n"}' tests/test.saga > tests/test-saga.js
./mqjs -I tests/test-saga.js plan4/as2.js

echo ""
echo "=== pan-saga: node ==="
cat tests/test.saga | node tests/pan-saga.js

echo ""
echo "=== elf-unit: node ==="
node tests/elf-unit.js

echo ""
echo "=== elf-unit: deno ==="
deno run --preload=./plan4/as2.js tests/elf-unit.js
