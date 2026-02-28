// elf-unit.js — polyglot (node, deno, mqjs)
// load as2 if not already present
;(function() {
  if (typeof globalThis.as2 !== 'undefined') return

  // Node CJS
  if (typeof require !== 'undefined') {
    try { require('../plan4/as2.js'); return } catch(e) {}
  }

  // Deno / Node ESM — can't do dynamic require here synchronously,
  // so as2.js must be loaded via --import or the runner handles it.
  // mqjs: preload via -I flag
})()

var string = 'string'
var bool = 'boolean'
var number = 'number'

var Types = {
  string: string,
  bool: bool,
  number: number,
  True: True,
  False: False,
  Value: Value,
  Precision: Precision,
  Text: Text,
  Add: Add,
  Subtract: Subtract,
  Multiply: Multiply,
  Divide: Divide,
  Modulo: Modulo,
  Saga: Saga,
  Self: Self,
  Box: Box,
  Expect: Expect,
  Describe: Describe
}

function True() { return true }
function False() { return false }
function Value(x) { return x }
function Precision(x) { return parseFloat(x) }
function Text(x) {
  if(!x) x = ''
  return x.toString()
}
function Add(a, b) { return a + b }
function Subtract(a, b) { return a - b }
function Multiply(a, b) { return a * b }
function Divide(a, b) { return a / b }
function Modulo(a, b) { return a % b }

function saga(x) {
  if (typeof globalThis.as2 === 'function') return globalThis.as2(Text(x))
  return ''
}
function Saga(x) { return saga(Text(x)) }
function Self(x) { return Box(x) }
function Box(x) { return { x } }

function Expect(a, b) {
  if(a === b) {
    Success()
  } else {
    console.log('error: ', a, b)
    Failure()
  }
}
function Describe(x, a) {
  console.log(x, a(Success))
}
function Success() { return True() }
function Failure() { throw new Error('Strongly Typed No No!') }

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------
Describe('True is true', function callback(done) {
  Expect(True(), true)
  return done()
})

Describe('False is not true', function callback(done) {
  Expect(False(), !true)
  return done()
})

Describe('A value could be anything really', function callback(done) {
  Expect(typeof Value(True()), bool)
  Expect(typeof Value(False()), bool)
  Expect(typeof Text(), string)
  Expect(typeof Value(123), number)
  Expect(typeof Value(123.98), number)
  Expect(typeof Precision('123.98'), number)
  return done()
})

Describe('Math will always math', function callback(done) {
  Expect(Add(3,1), 4)
  Expect(Subtract(3,1), 2)
  Expect(Subtract(1,3), -2)
  Expect(Multiply(9,9), 81)
  Expect(Divide(9,9), 1)
  Expect(Modulo(9,9), 0)
  return done()
})

Describe('A Saga will always be a string', function callback(done) {
  Expect(typeof Saga(123), string)
  Expect(typeof Saga('Hello'), string)
  Expect(typeof Saga(function(){}), string)
  Expect(typeof Saga(True()), string)
  Expect(typeof Saga(False()), string)
  Expect(typeof Saga(Value()), string)
  Expect(typeof Saga(Precision()), string)
  Expect(typeof Saga(Text()), string)
  return done()
})

Describe('A plaintext saga will output markup language', function callback(done) {
  var input = ''
  input += '# Ext/Int Alfheim'
  input += '\n'
  input += '@ Silly'
  input += '\n'
  input += '> Remember Xanadu? lol'

  var output = Saga(input)
  Expect(typeof output, string)

  if (typeof globalThis.as2 === 'function') {
    // as2 is wired — expect real markup
    Expect(output.indexOf('<hypertext-address>') > -1, true)
    Expect(output.indexOf('<hypertext-quote>') > -1, true)
  } else {
    // mqjs fallback — not yet implemented
    console.log('error: ', 'todo: implement saga in mqjs')
  }

  return done()
})

Describe('activities() returns AS2 objects', function callback(done) {
  if (typeof globalThis.as2 !== 'function' || typeof globalThis.as2.activities !== 'function') {
    console.log('error: ', 'todo: as2.activities not available')
    return done()
  }

  var input = ''
  input += '# Ext/Int Alfheim'
  input += '\n'
  input += '@ Silly'
  input += '\n'
  input += '> Remember Xanadu? lol'
  input += '\n'
  input += '^ fade to black'

  var acts = globalThis.as2.activities(input)
  Expect(Array.isArray(acts), true)
  Expect(acts.length > 0, true)

  var create = acts.find(function(a) { return a.type === 'Create' })
  Expect(!!create, true)
  Expect(create.actor.name, 'Silly')
  Expect(create.object.content, 'Remember Xanadu? lol')
  Expect(create.location, 'Ext/Int Alfheim')

  var effect = acts.find(function(a) { return a.type === 'Effect' })
  Expect(!!effect, true)
  Expect(effect.content, 'fade to black')

  return done()
})
