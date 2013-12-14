/** @jsx React.DOM */

var _ = require('lodash')
  , keys = require('keys')

  , states = require('./states')

var Tags = React.createClass({displayName: 'Tags',

  getInitialState: function () {
    var defaultValue = this.props.defaultValue
      , value = defaultValue || []
      , editing = this.props.editing
      , input = ''
    editing = 'undefined' === typeof editing ? false : editing
    return {
      value: value,
      editing: editing,
      focused: this.props.focused || false,
      input: input
    }
  },

  // loading data
  componentWillMount: function () {
    this.load()
  },
  load: function () {
    if (!this.props.load) return;
    this.props.load(function (tags) {
      this.setState({value: tags})
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
    var tags = this.state.value.slice()
    var nstate = states[name](this.state, this.props)
    if (!nstate) return
    this.setState(nstate)
    if (!nstate.value) return
    if (!_.isEqual(tags, nstate.value) && this.props.save) {
      this.props.save(nstate.value, function (tags) {
        this.setState({value: tags})
      }.bind(this))
    }
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
    if (this.props.save) {
      this.props.save(tags, function (tags) {
        this.setState({value: tags})
      }.bind(this))
    }
  },

  // and the render!
  render: function () {
    var ln = this.state.input.length
      , children = this.state.value.map(function (tag, i) {
          return (
            React.DOM.div( {className:"tag"}, 
              React.DOM.span( {className:"text", onClick:this.edit.bind(this, i)}, tag),
              React.DOM.div( {className:"remove-tag small-btn",
              onClick:this.remove.bind(this, i)}, "×")
            )
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
        React.DOM.span( {className:"plus small-btn",
              style:{display: (this.state.focused && false === this.state.editing) ? 'none' : 'inline-block'},
              onClick:this.focus}, "+")
      )
    )
  }
})

module.exports = Tags
