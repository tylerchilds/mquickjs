// tests/pan-saga.js — polyglot (node, bun, deno, mqjs)
;(function() {
  if (typeof globalThis.as2 !== 'undefined') return
  if (typeof require !== 'undefined') {
    try { require('../plan4/as2.js'); return } catch(e) {}
  }
  // deno: preload via --preload; mqjs: preload via -I
})()

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
var pass = 0
var fail = 0

function assert(label, actual, expected) {
  var ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (ok) {
    pass++
  } else {
    console.log('  ✗', label)
    console.log('    expected:', JSON.stringify(expected))
    console.log('    actual:  ', JSON.stringify(actual))
    fail++
  }
}

function describe(label, fn) {
  console.log('\n' + label)
  fn()
}

function arrayFind(arr, fn) {
  for (var i = 0; i < arr.length; i++) {
    if (fn(arr[i])) return arr[i]
  }
  return undefined
}

function arrayFilter(arr, fn) {
  var out = []
  for (var i = 0; i < arr.length; i++) {
    if (fn(arr[i])) out.push(arr[i])
  }
  return out
}

function contains(str, sub) {
  return str.indexOf(sub) !== -1
}

// ---------------------------------------------------------------------------
// fixture — stdin if piped, inline otherwise
// ---------------------------------------------------------------------------
function getInlineSaga() {
  return [
    '# Int. Bengo Apt.',
    'Elevator lobby BENGO reaches from elevator and waves to TY',
    '@ Bengo',
    '> if you omit the hyphen it\'ll redirect you to',
    '<hello-world',
    '@ ty & excited',
    '> I\'m a clown',
    '! delete this later but that\'s embedded html',
    '^ fade to black',
  ].join('\n')
}

function runTests(saga, isInline) {
  describe('as2() HTML output', function() {
    var html = globalThis.as2(saga)
    assert('returns a string', typeof html, 'string')
    assert('contains address tag', contains(html, '<hypertext-address>'), true)
    assert('contains effect tag', contains(html, '<hypertext-effect>'), true)
    assert('contains quote tag', contains(html, '<hypertext-quote>'), true)
  })

  describe('as2.activities() AS2 output', function() {
    var acts = globalThis.as2.activities(saga)

    assert('returns an array', Array.isArray(acts), true)
    assert('has activities', acts.length > 0, true)

    var creates = arrayFilter(acts, function(a) { return a.type === 'Create' })
    assert('has Create activities', creates.length > 0, true)

    if (isInline) {
      assert('Create has location', creates[0].location, 'Int. Bengo Apt.')
      assert('Create actor name', creates[0].actor.name, 'Bengo')
      assert('Create object type', creates[0].object.type, 'Note')
      assert('Create object content', creates[0].object.content, "if you omit the hyphen it'll redirect you to")
    } else {
      assert('Create has location', creates[0].location, 'Int. Photography Set - White backdrop')
      assert('Create actor name', creates[0].actor.name, 'Person')
      assert('Create object type', creates[0].object.type, 'Note')
      assert('Create object content', creates[0].object.content, 'I am a person.')
    }

    var effects = arrayFilter(acts, function(a) { return a.type === 'Effect' })
    assert('has Effect activities', effects.length > 0, true)
    assert('Effect content', effects[0].content, isInline ? 'fade to black' : 'Paper Cutaway')

    var narrates = arrayFilter(acts, function(a) { return a.type === 'Narrate' })
    assert('has Narrate activities', narrates.length > 0, true)

    if (isInline) {
      var helloWorld = arrayFind(narrates, function(a) { return a.content && contains(a.content, 'hello-world') })
      assert('Narrates hello-world element', !!helloWorld, true)
    } else {
      var url = arrayFind(narrates, function(a) { return a.content && contains(a.content, 'comedymap.org') })
      assert('Narrates URL element', !!url, true)
    }
  })

  describe('as2.activities() array compatible', function() {
    var acts = globalThis.as2.activities(saga)
    assert('returns array', Array.isArray(acts), true)
    assert('has items', acts.length > 0, true)
    var validTypes = ['Create', 'Narrate', 'Effect']
    var firstTypeValid = false
    for (var i = 0; i < validTypes.length; i++) {
      if (validTypes[i] === acts[0].type) { firstTypeValid = true; break }
    }
    assert('first item type is valid', firstTypeValid, true)
  })

  console.log('\n' + (fail === 0 ? '✓' : '✗'),
    pass + ' passed,', fail + ' failed')

  if (fail > 0 && typeof process !== 'undefined') process.exit(1)
}

// ---------------------------------------------------------------------------
// runtime entry
// ---------------------------------------------------------------------------
var isQuickJS = typeof scriptArgs !== 'undefined'
var isDeno    = typeof Deno !== 'undefined'
var isBun     = typeof Bun !== 'undefined'
var isNode    = typeof process !== 'undefined' && !isDeno && !isBun

if (isQuickJS) {
  var saga = globalThis.__saga
  if (saga) {
    runTests(saga, false)
  } else {
    runTests(getInlineSaga(), true)
  }
}

if (isDeno) {
  var buf = new Uint8Array(1024 * 1024)
  var n = Deno.stdin.readSync(buf)
  var input = new TextDecoder().decode(buf.subarray(0, n)).trim()
  if (input) {
    runTests(input, false)
  } else {
    runTests(getInlineSaga(), true)
  }
}

if (isNode || isBun) {
  if (!process.stdin.isTTY) {
    var chunks = []
    process.stdin.on('data', function(d) { chunks.push(d) })
    process.stdin.on('end', function() {
      runTests(chunks.join(''), false)
    })
  } else {
    runTests(getInlineSaga(), true)
  }
}
