// plan4/pan-saga.js — PanSaga web component
// depends on as2.js being loaded first (sets globalThis.as2)

class PanSaga extends HTMLElement {
  connectedCallback() {
    var slot = this.querySelector('script[slot="src"]')
    var src = this.getAttribute('src')

    if (src) {
      fetch(src)
        .then(function(r) { return r.text() }.bind(this))
        .then(function(text) { this._load(text) }.bind(this))
        .catch(function() {
          if (slot) this._load(slot.textContent)
        }.bind(this))
    } else if (slot) {
      this._load(slot.textContent)
    }
  }

  _load(text) {
    this._text = text
    this._acts = globalThis.as2.activities(text)

    var output = document.createElement('div')
    output.className = 'pan-saga-output'
    output.innerHTML = globalThis.as2(text)
    this.appendChild(output)

    this.dispatchEvent(new CustomEvent('saga-ready', { bubbles: true }))
  }

  async *activities() {
    yield* (this._acts || [])
  }
}

customElements.define('pan-saga', PanSaga)
