
var _ = require('lodash')

module.exports = {
  backspace: backspace,
  blur: blur,
  'return': return_,
  'shift tab': shiftTab,
  tab: tab
}

function stateMe(tags, cur, state) {
  var full = _.extend({}, cur, state)
  if (false !== full.editing) {
    if (full.editing < 0) state.editing = full.editing = 0
    if (full.editing > tags.length - 1) state.editing = full.editing = false
    if (full.editing !== false) state.input = tags[state.editing]
  }
  return state
}

function shiftTab(tags, state, props) {
  if (state.editing === false) {
    if (state.input.trim() === '') {
      if (tags.length === 0 && props && props.onPrev && props.onPrev()) {
        return {focused: false, value: [], input: ''}
      }
      return stateMe(tags, state, {
        editing: tags.length ? tags.length - 1 : false,
      })
    }
    tags.push(state.input)
    return stateMe(tags, state, {
      value: tags,
      editing: tags.length - 2
    })
  }
  if (state.input.trim() === '') {
    if (state.editing > 0)
      tags.splice(state.editing, 1)
    else
      tags[0] = ''
  } else {
    tags[state.editing] = state.input
  }
  if (state.editing === 0 && props && props.onPrev && props.onPrev()) {
    return {focused: false, value: tags, input: ''}
  }
  return stateMe(tags, state, {
    value: tags,
    editing: state.editing - 1
  })
}

function tab(tags, state, props) {
  if (state.editing === false) {
    if (state.input.trim() === '') {
      if (props && props.onNext && props.onNext()) {
        return {focused: false, input: ''}
      }
      return
    }
    tags.push(state.input)
    return {
      value: tags,
      input: ''
    }
  }
  if (state.input.trim() === '') {
    tags.splice(state.editing, 1)
  } else {
    tags[state.editing] = state.input
    state.editing += 1
  }
  return stateMe(tags, state, {
    value: tags,
    editing: state.editing,
    input: ''
  })
}

function backspace(tags, state) {
  var editing = state.editing
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
  return stateMe(tags, state, {
    value: tags,
    editing: editing
  })
}

function return_(tags, state) {
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

function blur(tags, state) {
  if (state.editing === false) {
    if (state.input.trim() === '') {
      return {focused: false, input: ''}
    }
    return {
      value: tags.concat(state.input),
      focused: false,
      input: ''
    }
  }
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

