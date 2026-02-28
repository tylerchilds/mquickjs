(function iife() {

/*
  rune table:
    ! comment
    # location
    ^ effect
    @ actor
    > quote
    & parenthetical
    < embed actor element
*/

function as2(script) {
  if(!script) return ''
  var state = {}
  var actors = state.actors = {}
  var time = 'NORMAL_TIME'
  var property = ''
  var actor = ''
  var scene = ''

  var RuneTable = {
    '!': append.bind({}, 'hypertext-comment'),
    '#': append.bind({}, 'hypertext-address'),
    '^': append.bind({}, 'hypertext-effect'),
    '@': append.bind({}, 'hypertext-puppet'),
    '>': append.bind({}, 'hypertext-quote'),
    '&': append.bind({}, 'hypertext-parenthetical'),
    '<': function puppet(x) {
      actors[x] = {}
      actor = x
      time = 'ACTOR_TIME'
    }
  }

  var times = {
    'NORMAL_TIME': normalTime,
    'PROP_TIME': propertyTime,
    'ACTOR_TIME': actorTime,
  }

  var lines = script.split('\n')
  for (var line of lines) {
    if (typeof line !== 'string') continue
    var beat = line.trim()
    ;(times[time] || noop)(beat)
  }

  if(time !== 'NORMAL_TIME') times[time]('')

  return template(state, scene)

  function normalTime(line) {
    if(!line.trim()) { append("hypertext-blankline", ""); return }
    var rune = line[0]
    if(Object.keys(RuneTable).indexOf(rune) > -1) {
      var beat = line.split(rune)
      var text = beat[1]
      return RuneTable[rune](text.trim())
    }
    append('hypertext-action', line)
  }

  function propertyTime(line, separator) {
    separator = separator || ':'
    var index = line.indexOf(separator)
    var key = line.substring(0, index)
    var value = line.substring(index+1)
    if(!value) { time = 'NORMAL_TIME'; return }
    state[property][key.trim()] = value.trim()
  }

  function actorTime(line, separator) {
    separator = separator || ':'
    var index = line.indexOf(separator)
    var key = line.substring(0, index)
    var value = line.substring(index+1)
    if(!key) {
      var properties = actors[actor]
      var innerHTML = ''
      var innerText = ''
      var attributes = Object.keys(properties).map(function(x) {
        if(x === 'html') { innerHTML = properties[x]; return '' }
        if(x === 'text') { innerText = properties[x]; return '' }
        return [x, '="', properties[x], '" '].join('')
      }).join('')
      scene += "<"+actor+" "+attributes+">"+(innerHTML || innerText)+"</"+actor+">"
      time = 'NORMAL_TIME'
      if(value) normalTime(line)
      return
    }
    actors[actor][key.trim()] = value.trim()
  }

  function append(actor, body) {
    scene += "<"+actor+">"+body+"</"+actor+">"
  }

  function noop() {}
}

// ---------------------------------------------------------------------------
// activities() — parses saga text into an array of AS2 JSON activity objects
// ---------------------------------------------------------------------------
function activities(script) {
  if(!script) return []

  var result = []
  var location = ''
  var currentActor = ''
  var time = 'NORMAL_TIME'
  var pendingActor = null  // waiting for a > quote to complete a Create

  var lines = script.split('\n')

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    if (typeof line !== 'string') continue
    var beat = line.trim()
    if (!beat) continue

    var rune = beat[0]
    var text = beat.slice(1).trim()

    if (time === 'ACTOR_TIME') {
      // collecting key: value pairs for an embedded element
      var sep = beat.indexOf(':')
      var key = beat.substring(0, sep).trim()
      var val = beat.substring(sep + 1).trim()
      if (!key) {
        // blank line ends actor time
        result.push({
          type: 'Narrate',
          actor: { type: 'Narrator' },
          content: pendingActor,
          location: location || undefined
        })
        pendingActor = null
        time = 'NORMAL_TIME'
      } else {
        // accumulate attributes into the element string
        var lastNarrate = result[result.length - 1]
        if (lastNarrate && lastNarrate.type === 'Narrate') {
          // append attribute to element content
          lastNarrate.content = lastNarrate.content.replace(/\/?>\s*$/, '')
          lastNarrate.content += ' ' + key + (val ? '="' + val + '"' : '') + '>'
        }
      }
      continue
    }

    switch(rune) {
      case '#':
        // set location for subsequent activities
        location = text
        break

      case '@':
        // puppet — next > will be the quote
        // handle compound lines like "@ Bengo & excited"
        var parts = text.split('&')
        currentActor = parts[0].trim()
        break

      case '>':
        // quote — completes a Create activity from the current actor
        if (currentActor) {
          result.push({
            type: 'Create',
            actor: { name: currentActor },
            object: { type: 'Note', content: text },
            location: location || undefined
          })
          currentActor = ''
        } else {
          result.push({
            type: 'Narrate',
            actor: { type: 'Narrator' },
            content: text,
            location: location || undefined
          })
        }
        break

      case '<':
        // embedded element — Narrate immediately, no actor time needed for activities
        var elementName = text.trim()
        result.push({
          type: 'Narrate',
          actor: { type: 'Narrator' },
          content: '<' + elementName + '>',
          location: location || undefined
        })
        // don't enter ACTOR_TIME for activities parser — that's for HTML attribute collection
        break

      case '!':
        // comment — Narrate from Narrator
        result.push({
          type: 'Narrate',
          actor: { type: 'Narrator' },
          content: text,
          location: location || undefined
        })
        break

      case '^':
        // effect
        result.push({
          type: 'Effect',
          content: text,
          location: location || undefined
        })
        break

      case '&':
        // parenthetical modifies current actor context, skip standalone
        break

      default:
        // action line — narrator describes
        result.push({
          type: 'Narrate',
          actor: { type: 'Narrator' },
          content: beat,
          location: location || undefined
        })
        break
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// templates
// ---------------------------------------------------------------------------
var templates = {
  'thelanding.page': spa,
  'wrapper': wrapper,
  'screenplay': screenplay,
}

function template(state, content){
  if(!state.template) return content
  var T = templates[state.template.engine]
  if(!T) return content
  return T(content)
}

function spa(content) {
  return "<header><mast-head></mast-head></header><nav><quick-links></quick-links></nav><main>"+content+"</main><footer><mega-footer></mega-footer></footer>"
}
function wrapper(content) {
  return '<div class="wrapper">'+content+'</div>'
}
function screenplay(content) {
  return '<div class="darkroom"><div class="screenplay">'+content+'</div></div>'
}

// ---------------------------------------------------------------------------
// exports
// ---------------------------------------------------------------------------
globalThis.as2 = as2
globalThis.as2.activities = activities

// ---------------------------------------------------------------------------
// polyglot stdin runner
// ---------------------------------------------------------------------------
var isQuickJS = typeof scriptArgs !== 'undefined'
var isDeno    = typeof Deno !== 'undefined'
var isNode    = typeof process !== 'undefined' && !isDeno

if (isQuickJS) {
  // mqjs: pass saga file as second arg — ./mqjs plan4/as2.js tests/test.saga
  var filename = scriptArgs[1]
  if (filename) {
    // load() evals JS, so we can't use it for .saga files directly.
    // Instead, embed the saga in a tiny JS wrapper at the call site,
    // or use the -I flag to preload. For now log a clear error.
    console.log('mqjs: pass saga as JS via -e or embed in a wrapper script')
    console.log('  e.g.: ./mqjs -e "var __saga=\'# Ext/Int Alfheim\\n^ fade out\'" plan4/as2.js')
  }
  var __saga = globalThis.__saga
  if (__saga) {
    console.log(as2(__saga))
    var acts = activities(__saga)
    console.log(JSON.stringify(acts, null, 2))
  }
}

if (isNode) {
  var chunks = []
  process.stdin.on('data', function(d) { chunks.push(d) })
  process.stdin.on('end', function() {
    var input = chunks.join('')
    console.log(as2(input))
    var acts = activities(input)
    console.log(JSON.stringify(acts, null, 2))
  })
}

if (isDeno) {
  var buf = new Uint8Array(1024 * 1024)
  var n = Deno.stdin.readSync(buf)
  var input = new TextDecoder().decode(buf.subarray(0, n))
  console.log(as2(input))
  var acts = activities(input)
  console.log(JSON.stringify(acts, null, 2))
}

})()
