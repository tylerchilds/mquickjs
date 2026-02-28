#!/bin/sh

echo "=== as2: node ==="
cat tests/test.saga | node plan4/as2.js

echo ""
echo "=== as2: deno ==="
cat tests/test.saga | deno run plan4/as2.js

echo ""
echo "=== as2: mqjs ==="
# mqjs cannot read .saga files directly (load() evals JS)
# workaround: embed saga text via -e into globalThis.__saga
SAGA=$(cat tests/test.saga)
./mqjs plan4/as2.js
# TODO: find a way to pass raw text to mqjs without eval

echo ""
echo "=== pan-saga: node ==="
cat tests/test.saga | node tests/pan-saga.js

echo ""
echo "=== elf-unit: node ==="
node tests/elf-unit.js

echo ""
echo "=== elf-unit: deno ==="
deno run tests/elf-unit.js
