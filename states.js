
var _ = require('lodash')

module.exports = {
  backspace: backspace,
  blur: blur,
  'return': return_,
  tab: tab
}

function stateMe(cur, state) {
  var full = _.extend({}, cur, state)
  if (false !== full.editing) {
    if (full.editing < 0) state.editing = full.editing = 0
    if (full.editing > full.value.length - 1) state.editing = full.editing = false
    if (full.editing !== false) state.input = full.value[state.editing]
  }
  return state
}

/*
function tab(state) {
  if (state.editing === false) {
    if (
}
*/

function backspace(state) {
  var editing = state.editing
    , tags = state.value
  if (editing === false) {
    if (tags.length > 0) {
      editing = tags.length - 1
    } else {
      return
    }
  } else if (editing > 0) {
    tags.splice(editing, 1)
      editing -= 1
  } else {
    return
  }
  return stateMe(state, {
    value: tags,
    editing: editing
  })
}

/*
function edited(blur, editing, save) {
  var tags = state.value
    , old = tags[state.editing]
    , input = ''
  if (arguments.length < 2) editing = false
  if (editing !== false && 'undefined' !== typeof editing) input = this.state.value[editing]
  var tag = tags[this.state.editing] = this.state.input
  if (!this.state.input.trim().length) {
    tags.splice(this.state.editing, 1)
    if (editing > this.state.editing) editing -= 1
  }
  this.setState({value: tags, input: input, focused: !blur, editing: editing})
  if (!this.props.save || old === tag) return
  this.props.save(tags, function (tags) {
    this.setState({value: tags})
  }.bind(this))
}

function focus(state) {
  return {focused: true, editing: false}
}
*/

function return_(state) {
  var tags = state.value
  if (state.editing !== false) {
    tags[state.editing] = state.input
  } else {
    tags.push(state.input)
  }
  return {
    value: tags,
    input: '',
    editing: false
  }
}

function blur(state) {
  if (state.editing === false) {
    if (state.input.trim() === '') {
      return {focused: false, input: ''}
    }
    return {
      value: state.value.concat(state.input),
      focused: false,
      input: ''
    }
  }
  var tags = state.value
  if (state.input.trim() === '') {
    tags.splice(state.editing, 1)
  } else {
    tags[state.editing] = state.input
  }
  return {
    value: tags,
    focused: false,
    editing: false,
    input: ''
  }
}

function tab(state, next) {
  if (false === state.editing) {
    if (next && next()) {
      if (state.focused) this.blur()
        return false
    }
    return this.doneInput(false, false)
  }
  var editing = this.state.editing + 1
    if (editing > this.state.value.length - 1) {
      editing = false
    }
  this.doneInput(false, editing)
}

