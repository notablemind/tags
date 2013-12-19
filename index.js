/** @jsx React.DOM */

var _ = require('lodash')
  , keys = require('keys')

  , states = require('./states')

var Tags = React.createClass({displayName: 'Tags',

  getDefaultProps: function () {
    return {
      onChange: function () {
        console.warn('Trying to change tags, but no onChange handler set')
      },
      plusButton: true,
      plusClass: '',
      value: [],
      className: ''
    }
  },
  getInitialState: function () {
    var editing = this.props.editing
      , input = ''
    editing = 'undefined' === typeof editing ? false : editing
    return {
      editing: editing,
      focused: this.props.focused || false,
      input: input
    }
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
    var tags = this.props.value.slice()
    var nstate = states[name](tags, this.state, this.props)
    if (!nstate) return
    if (nstate.value) {
      tags = nstate.value
      this.props.onChange(tags)
      delete nstate.value
    }
    this.setState(nstate)
  },

  keyDown: keys({
    'backspace': function (e) {
      if (this.state.input.length !== 0) return true
      this.stateChange('backspace')
    },
    'escape': function (e) {
      this.stateChange('blur')
    },
    'return': function (e) {
      this.stateChange('return')
    },
    'tab': function (e) {
      this.stateChange('tab')
    },
    'shift tab': function (e) {
      this.stateChange('shift tab')
    }
  }), 

  blur: function () {
    this.stateChange('blur')
  },
  focus: function () {
    var editing = this.props.value.length ? 0 : false
    this.setState({
      input: editing === false ? '' : this.props.value[editing],
      editing: editing,
      focused: true,
    })
  },
  focusEnd: function () {
    this.setState({
      input: '',
      focused: true,
      editing: false
    })
  },
  edit: function (i) {
    this.setState({
      input: this.props.value[i],
      focused: true,
      editing: i
    })
  },
  remove: function (i) {
    var tags = this.props.value
    tags.splice(i, 1)
    this.props.onChange(tags)
    this.setState({
      input: '',
      focused: false,
      editing: false
    })
  },

  // and the render!
  render: function () {
    var ln = this.state.input.length
      , children = this.props.value.map(function (tag, i) {
          return React.DOM.div(
            {className:"tag"}, 
            React.DOM.span({className:"text", onClick:this.edit.bind(this, i)}, tag),
            React.DOM.div({className:"remove-tag small-btn", onClick:this.remove.bind(this, i)}, "×")
          )
        }.bind(this))

    if (this.state.focused) {
      var input = (
        React.DOM.input( {ref:"input",
          onBlur:this.blur,
          style:{
            width: (ln > 3 ? ln : 3)*7 + 20
          },
          onKeyDown:this.keyDown,
          onChange:this.inputChange,
          value:this.state.input})
      )

      if (this.state.editing !== false) {
        children.splice(this.state.editing, 1, input)
      } else {
        children.push(input)
      }
    }

    return (
      React.DOM.div( {className:'tags ' + this.props.className}, 
        children,
        React.DOM.span( {className:"plus small-btn " + this.props.plusClass,
              style:{display: (this.state.focused && false === this.state.editing) ? 'none' : 'inline-block'},
              onClick:this.focusEnd}, this.props.plusButton ? "+" : '')
      )
    )
  }
})

module.exports = Tags
