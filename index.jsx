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
      this.stateChange('shift tab')
    }
  }, 

  blur: function () {
    this.setState({
      editing: false,
      input: '',
      focused: false
    })
  },
  focus: function () {
    this.setState({
      input: '',
      focused: true,
      editing: false
    })
  },
  edit: function (i) {
    this.setState({
      input: this.state.value[i],
      focused: true,
      editing: i
    })
  },
  remove: function (i) {
    var tags = this.state.value
    tags.splice(i, 1)
    this.setState({
      input: '',
      focused: false,
      editing: false,
      tags: tags
    })
  },

  // and the render!
  render: function () {
    var ln = this.state.input.length
      , children = this.state.value.map(function (tag, i) {
          return (
            <div className="tag">
              <span className="text" onClick={this.edit.bind(this, i)}>{tag}</span>
              <div className="remove-tag small-btn"
              onClick={this.removeTag.bind(this, i)}>&times;</div>
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
              style={{display: (this.state.focused && false === this.state.editing) ? 'none' : 'inline-block'}}
              onClick={this.focus}>+</span>
      </div>
    )
  }
})

module.exports = Tags
