(function iife() {
/*

// the tanka of the tiniest violin

// Fixing the tiniest violin is the easiest trick in the book. All you do is delete four forward slashes. That's it.

////

















    ^
   <@>
   {&!
    #

  Elve




    ^      ^      ^      ^      ^      ^      ^
   <@>    <@>    <@>    <@>    <@>    <@>    <@>
   {&!    {&!    {&!    {&!    {&!    {&!    {&!
    #      #      #      #      #      #      #

  Silly  Sally  Sully  Shelly  Sonny   Wally   Thesillonious Caramera
  1998   1970   2077   2038    2012  1888    now


















  mit license. <email@tychi.me> 1989-current

*/

function as2(script) {
  // nothing in, nothing out
  if(!script) return ''
  var state = {}
  // what do we embed
  // as actors are worn their attributes may become modified
  var actors = state.actors = {}
  // state changes cause time dilations
  var time = 'NORMAL_TIME'
  // what model
  var property = ''
  // what perspective
  var actor = ''
  // what display
  var scene = ''

  // advanced-technology something magic whatever runes are a metaphor
  var RuneTable = {
    // comments, like this one you're reading now, are not for the audience
    '!': append.bind({}, 'hypertext-comment'),
    // addresses are space time locations where events and discussions happen
    '#': append.bind({}, 'hypertext-address'),
    // effects are the post production manipulations for aesthetic
    '^': append.bind({}, 'hypertext-effect'),
    // puppets are the performers of parenthetical prose
    '@': append.bind({}, 'hypertext-puppet'),
    // quotes are verbatim messages from puppets or the mind of sillonious
    '>': append.bind({}, 'hypertext-quote'),
    // parentheticals are subtext of expression
    '&': append.bind({}, 'hypertext-parenthetical'),
    // properties are able to change truths about the very facet of reality
    /*
    '{': (x) => {
      // clear whichever property from the stash
      state[x] = {}
      // use whatever property
      property = x
      // what time is it? property time!
      time = 'PROP_TIME'
    },*/
    // actors are able to display projections beyond black and white text
    '<': function puppet(x) {
      // clear whichever actor from the stash
      actors[x] = {}
      // use whatever actor
      actor = x
      // what time is it? actor time!
      time = 'ACTOR_TIME'
    }
  }

  // mapping our concept of time to the atomic execution units underneath
  var times = {
    // line by line until finished
    'NORMAL_TIME': normalTime,
    // accesses property and stores key value pairs after sequence break
    'PROP_TIME': propertyTime,
    // accesses actor and embeds key value pairs after sequence break
    'ACTOR_TIME': actorTime,
  }

  // collect the lines of our script
  if(!script) return
  var lines = script.split('\n')

  // loop over our lines one at a time
  for (var line of lines) {
    if (typeof line !== 'string') continue
    var beat = line.trim()
    // and evaluating now and the times, process our line in the now time
    ;(times[time] || noop)(beat)
  }

  // edge case to clean up when stepping outside of normal time
  if(time !== 'NORMAL_TIME') times[time]('')

  return template(state, scene)

  // just process our runes, yes magic, just straight forward level 1 magic
  function normalTime(line) {
    // anything here?
    if(!line.trim()) {
      // drop some invisible hype
      append("hypertext-blankline", "")
      // normal time is over
      return
    }

    // the rune will always be the first glyph
    var rune = line[0]

    // however, the first glyph won't always be a rune.
    if(Object.keys(RuneTable).indexOf(rune) > -1) {
      // decouple the incantation from the rune
      var beat = line.split(rune)
      var text = beat[1]
      // apply the rune from the table with the spell
      return RuneTable[rune](text.trim())
    }

    // drop some actionable hype
    append('hypertext-action', line)
    // normal time is over
    return
  }

  // process the sequence to understand our property's, well, properties.
  function propertyTime(line, separator) {
    if(!separator) {
      separator = ':'
    }
    // where in the line is our break
    var index = line.indexOf(separator)
    // before then is the attribute
    var key = line.substring(0, index)
    // after then is the data
    var value = line.substring(index+1)
    // no data?
    if(!value) {
      // back to normal time
      time = 'NORMAL_TIME'
      return
    }

    // update our property of property of properties
    state[property][key.trim()] = value.trim()
  }

  // process the sequence to understand our actor's properties.
  function actorTime(line, separator) {
    if(!separator) {
      separator = ':'
    }
    // where in the line is our break
    var index = line.indexOf(separator)
    // before then is the attribute
    var key = line.substring(0, index)
    // after then is the data
    var value = line.substring(index+1)

    // no data?
    if(!key) {
      // collect the properties from our actor
      var properties = actors[actor]
      var innerHTML = ''
      var innerText = ''

      // convert them into hype attributes
      var attributes = Object.keys(properties)
        .map(function concat(x) {
          if(x === 'html') {
            innerHTML = properties[x]
            return ''
          }
          if(x === 'text') {
            innerText = properties[x]
            return ''
          }

          return [x, '="', properties[x], '" '].join('')
        }).join('')

      // add some hype to our scene
      scene += "<"+actor+attributes+">"+
        (innerHTML || innerText) +
      "</"+actor+">"

      // back to normal time
      time = 'NORMAL_TIME'
      if(value) normalTime(line)
      return
    }

    actors[actor][key.trim()] = value.trim()
  }

  function append(actor, body) {
    var hype = "<"+actor+">"+body+"</"+actor+">"
    scene += hype
  }

  function noop() {}
}

function validated(htmlString){
  var root = "<xml-html>"+htmlString+"</xml-html>"
  var parser = new DOMParser();
  var doc = parser.parseFromString(root, "application/xml");
  var errorNode = doc.querySelector('parsererror');
  return errorNode ? false : root
}

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
  return "" +
    "<header>" +
      "<mast-head></mast-head>" +
    "</header>" +
    "<nav>" +
      "<quick-links></quick-links>" +
    "</nav>" +
    "<main>" +
      content +
    "</main>" +
    "<footer>" +
      "<mega-footer></mega-footer>" +
    "</footer>"
}

function wrapper(content) {
  return "" +
    '<div class="wrapper">' +
      content +
    "</div>"
}

function screenplay(content) {
  return "" +
    '<div class="darkroom">' +
      '<div class="screenplay">' +
        content +
      "</div>" +
    "</div>"
}

globalThis.as2 = as2
})()

var unitTest = globalThis.as2("" +
"     # Int. Bengo Apt." +
"" +
"     ^ fade out" +
"")

console.log(unitTest)
