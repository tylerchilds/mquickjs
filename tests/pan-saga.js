import '../plan4/as2.js'

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
var pass = 0
var fail = 0

function assert(label, actual, expected) {
  var ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (ok) {
    console.log('  ✓', label)
    pass++
  } else {
    console.log('  ✗', label)
    console.log('    expected:', JSON.stringify(expected))
    console.log('    actual:  ', JSON.stringify(actual))
    fail++
  }
}

async function describe(label, fn) {
  console.log('\n' + label)
  await fn()
}

// ---------------------------------------------------------------------------
// fixture — read from stdin if piped, otherwise use inline
// ---------------------------------------------------------------------------
async function getSaga() {
  // check if stdin has data (piped)
  if (!process.stdin.isTTY) {
    return new Promise(function(resolve) {
      var chunks = []
      process.stdin.on('data', function(d) { chunks.push(d) })
      process.stdin.on('end', function() { resolve(chunks.join('')) })
    })
  }
  // inline fixture matching the spec example
  return [
    '# Int. Bengo Apt.',
    'Elevator lobby BENGO reaches from elevator and waves to TY',
    '@ Bengo',
    '> if you omit the hyphen it\'ll redirect you to',
    '<hello-world',
    '<pan-saga',
    'src:',
    '<iframe',
    'src:',
    'title:',
    'style:',
    'height: 50vh',
    '@ ty & excited',
    '> I\'m a clown',
    '! delete this later but that\'s embedded html',
    '^ fade to black',
  ].join('\n')
}

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------
async function main() {
  const saga = await getSaga()

  await describe('as2() HTML output', function() {
    const html = globalThis.as2(saga)
    assert('returns a string', typeof html, 'string')
    assert('contains address tag', html.indexOf('<hypertext-address>') > -1, true)
    assert('contains effect tag', html.indexOf('<hypertext-effect>') > -1, true)
    assert('contains quote tag', html.indexOf('<hypertext-quote>') > -1, true)
  })

  await describe('as2.activities() AS2 output', function() {
    const acts = globalThis.as2.activities(saga)

    assert('returns an array', Array.isArray(acts), true)
    assert('has activities', acts.length > 0, true)

    // location is set by # rune
    const creates = acts.filter(a => a.type === 'Create')
    assert('has Create activities', creates.length > 0, true)
    assert('Create has location', creates[0].location, 'Int. Bengo Apt.')
    assert('Create actor name', creates[0].actor.name, 'Bengo')
    assert('Create object type', creates[0].object.type, 'Note')
    assert('Create object content',
      creates[0].object.content,
      "if you omit the hyphen it'll redirect you to"
    )

    const effects = acts.filter(a => a.type === 'Effect')
    assert('has Effect activities', effects.length > 0, true)
    assert('Effect content', effects[0].content, 'fade to black')

    const narrates = acts.filter(a => a.type === 'Narrate')
    assert('has Narrate activities', narrates.length > 0, true)

    const helloWorld = narrates.find(a => a.content && a.content.indexOf('hello-world') > -1)
    assert('Narrates hello-world element', !!helloWorld, true)
  })

  await describe('PanSaga#activities AsyncIterable', async function() {
    // simulate what PanSaga would expose
    const acts = globalThis.as2.activities(saga)

    async function* toAsyncIterable(arr) {
      for (const item of arr) yield item
    }

    const iterable = toAsyncIterable(acts)
    assert('has Symbol.asyncIterator', typeof iterable[Symbol.asyncIterator], 'function')

    // collect via for-await
    const collected = []
    for await (const activity of toAsyncIterable(acts)) {
      collected.push(activity)
    }
    assert('for-await collects all activities', collected.length, acts.length)
    assert('first collected activity type is valid',
      ['Create','Narrate','Effect'].indexOf(collected[0].type) > -1,
      true
    )
  })

  // ---------------------------------------------------------------------------
  // summary
  // ---------------------------------------------------------------------------
  console.log('\n' + (fail === 0 ? '✓' : '✗'),
    pass + ' passed,', fail + ' failed')

  if (fail > 0) process.exit(1)
}

main()
