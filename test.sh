#!/bin/sh

./mqjs tests/elf-unit.js

cat tests/test.saga | ./mqjs plan4/as2.js
cat tests/test.saga | ./mqjs plan4/saga.js

cat tests/test.saga | deno plan4/as2.js
cat tests/test.saga | deno plan4/saga.js

cat tests/test.saga | node plan4/as2.js
cat tests/test.saga | node plan4/saga.js
