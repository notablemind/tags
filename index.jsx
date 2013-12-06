/** @jsx React.DOM */

var _ = require('lodash')
  , keys = require('keys')

/**
 *
 * Key bindings
 * - tab / shift-tab
 *    move to the next / previous tag. If the current tag is empty, then it
 *    will be removed
 * - backspace in an empty tag
 *    remove this tag and go to the previous one
 * - return
 *    commit this tag (if it isn't empty) and add another
 *
 * Input attributes:
 * - "focused" - whether it should start focused
 * - defaultValue - the value to prepopulate with. Use the "load" function to
 *   get dynamic information
 * - load(cb(tags)) pass in a getter
 * - save(tags, cb(tags)) pass in a setter
 *
 */

// TODO: blur && click interfere atm.

function nextEditing(shift, editing, ln) {
  if (editing === false) {
    if (shift && ln > 0) return ln-1
    return false
  }
  editing += shift ? -1 : 1
  if (editing < 0) return 0
  if (editing >= ln) return false
  return editing
}

var Tags = React.createClass({

  getInitialState: function () {
    var defaultValue = this.props.defaultValue
      , editing = this.props.editing
      , value = defaultValue != null ? defaultValue : []
      , input = ''
    editing = 'undefined' === typeof editing ? false : editing,
    return this.stateMe({
      value: value,
      editing: editing,
      focused: this.props.focused || false,
      input: editing
    })
  },

  // loading data
  componentWillMount: function () {
    this.load()
  },
  load: function () {
    if (!this.props.load) return
    this.props.load(function (tags) {
      this.setState(this.stateMe({value: tags})
    }.bind(this))
  },

  // all about the focus
  componentDidMount: function () {
    if (this.state.focused) {
      this.refs.input.getDOMNode().focus()
    }
  },
  componentWillReceiveProps: function (props) {
    if (props.focused) {
      this.setState({focused: true})
    }
  },
  componentDidUpdate: function () {
    if (this.state.focused) {
      this.refs.input.getDOMNode().focus()
    }
  },

  // events
  inputChange: function (e) {
    this.setState({input: e.target.value})
  },

  backspace: function () {
  },

  tab: function () {
  },

  doStateChange: function (which) {
    var nstate = this.stateChange[which]
  },

  stateChange: function (name) {
    var nstate = state[name](this.state)
    if (nstate) {
      this.setState(nstate)
    }
  },
  keyDown: keys({
    'backspace': function (e) {
      if (this.state.input.length !== 0) return
      e.preventDefault()
      this.stateChange('backspace')
    },
    'escape': function (e) {
      e.preventDefault()
      this.stateChange('blur')
    },
    'return': function (e) {
      e.preventDefault()
      this.stateChange('return')
    },
    'tab': function (e) {
      e.preventDefault()
      this.stateChange('tab')
      // adding a new tag
    },
    'shift tab': function (e) {
      e.preventDefault()
      // in the first position
      if (0 === this.state.editing || this.state.value.length === 0) {
        if (this.props.prev && this.props.prev()) {
          if (this.state.focused) this.blur()
          return false
        }
        return this.doneInput(false, 0)
      }
      var editing = this.state.editing - 1
      if (editing < 0) editing = 0
      if (this.state.value.length === 0) editing = false
      this.doneInput(false, editing)
    }
  }, 

  blur: function () {
  },
  focus: function () {
  },
  // add and remove
  doneInput: function (blur, editing) {
    if (this.state.editing !== false) {
      this.edited(blur, editing)
    } else {
      if (this.state.input.trim() === '') {
        if (editing !== false) {
          this.editTag(editing)
        }
        return
      }
      this.addTag(this.state.input, blur, editing)
    }
  },
  addTag: function (tag, unfocus, editing) {
    var tags = this.state.value
      , input = ''
    tags.push(tag)
    if (arguments.length < 2 || 'undefined' === typeof editing) editing = false
    if (editing !== false) input = this.state.value[editing]
    this.setState({value: tags, input: input, focused: !unfocus, editing: editing})
    if (!this.props.save) return
    this.props.save(tags, function (tags) {
      this.setState({value: tags})
    }.bind(this))
  },
  removeTag: function (tag) {
    var tags = this.state.value
      , i = tags.indexOf(tag)
      if (i === -1) return console.warn("Removing a non-existent tag", tag, tags)
        tags.splice(i, 1)
          this.setState({value: tags})
          if (!this.props.save) return
            this.props.save(tags, function (tags) {
              this.setState({value: tags})
            }.bind(this))
  },
  editTag: function (i, tags) {
    var state = {editing: i, focused: true, input: this.state.value[i]}
    if (arguments.length === 2) state.value = tags
    else tags = this.state.value
      if (state.editing > tags.length) state.editing = false
        this.setState(state)
  },
  // and the render!
  render: function () {
    var ln = this.state.input.length
      , children = this.state.value.map(function (tag, i) {
        return (
          <div className="tag">
          <span className="text" onClick={this.editTag.bind(this, i)}>{tag}</span>
          <div className="remove-tag small-btn"
          onClick={this.removeTag.bind(this, tag)}>&times;</div>
          </div>
          )
      }.bind(this))

    if (this.state.focused) {
      var input = (
        <input ref="input"
          onBlur={this.blur}
          style={{
            width: (ln > 3 ? ln : 3)*7 + 20
          }}
          onKeyDown={this.keyDown}
          onChange={this.inputChange}
          value={this.state.input}/>
      )

      if (this.state.editing !== false) {
        children.splice(this.state.editing, 1, input)
      } else {
        children.push(input)
      }
    }

    return (
      <div className={'tags ' + this.props.className}>
        {children}
        <span className="plus small-btn"
              style={{display: this.state.focused ? 'none' : 'inline-block'}}
              onClick={this.focus}>+</span>
      </div>
    )
  }
})

module.exports = Tags
