#!/bin/sh

LOG=tests/as2.log
> "$LOG"

echo "=== as2: node ===" | tee -a "$LOG"
cat plan4/index.saga | node plan4/as2.js >> "$LOG" 2>&1

echo "" | tee -a "$LOG"
echo "=== as2: deno ===" | tee -a "$LOG"
cat plan4/index.saga | deno run plan4/as2.js >> "$LOG" 2>&1

echo "" | tee -a "$LOG"
echo "=== as2: mqjs ===" | tee -a "$LOG"
awk 'BEGIN{printf "globalThis.__saga=\""} {gsub(/\\/, "\\\\"); gsub(/"/, "\\\""); printf "%s\\n", $0} END{printf "\";\n"}' plan4/index.saga > tests/test-saga.js
./mqjs -I tests/test-saga.js plan4/as2.js >> "$LOG" 2>&1

echo "" | tee -a "$LOG"
echo "=== as2: bun ===" | tee -a "$LOG"
cat plan4/index.saga | bun plan4/as2.js >> "$LOG" 2>&1

echo ""
echo "=== pan-saga: node ==="
cat plan4/index.saga | node tests/pan-saga.js

echo ""
echo "=== pan-saga: deno ==="
cat plan4/index.saga | deno run --preload=./plan4/as2.js tests/pan-saga.js

echo ""
echo "=== pan-saga: bun ==="
cat plan4/index.saga | bun tests/pan-saga.js

echo ""
echo "=== pan-saga: mqjs ==="
./mqjs -I tests/test-saga.js -I plan4/as2.js tests/pan-saga.js

echo ""
echo "=== elf-unit: node ==="
node tests/elf-unit.js

echo ""
echo "=== elf-unit: deno ==="
deno run --preload=./plan4/as2.js tests/elf-unit.js

echo ""
echo "=== elf-unit: bun ==="
bun tests/elf-unit.js

echo ""
echo "=== elf-unit: mqjs ==="
./mqjs -I plan4/as2.js tests/elf-unit.js

echo ""
echo "(as2 runner output saved to $LOG)"
