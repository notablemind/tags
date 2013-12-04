/** @jsx React.DOM */

var _ = require('lodash')

function nextEditing(shift, editing, ln) {
  if (editing === false) {
    if (shift) return ln-1
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
    return {
      value: defaultValue != null ? defaultValue : [],
      input: '',
      focused: this.props.focused || false,
      editing: false
    }
  },
  // loading data
  componentWillMount: function () {
    this.load()
  },
  load: function () {
    if (!this.props.load) return
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
  keyDown: function (e) {
    if (e.keyCode !== 13 && e.keyCode !== 9) return
    var editing = false
    if (e.keyCode === 9) {
      editing = nextEditing(e.shiftKey, this.state.editing, this.state.value.length)
    }
    this.doneInput(false, editing)
    e.preventDefault()
  },
  blur: function () {
    if (this.state.input.trim() !== '') {
      this.doneInput(true)
    } else {
      this.setState({focused: false})
    }
  },
  focus: function () {
    this.setState({focused: true, editing: false})
  },
  // add and remove
  doneInput: function (blur, editing) {
    if (this.state.editing !== false) {
      this.edited(blur, editing)
    } else {
      if (this.state.input.trim() === '') {
        return
      }
      this.addTag(this.state.input, blur, editing)
    }
  },
  edited: function (blur, editing) {
    var tags = this.state.value
      , old = tags[this.state.editing]
      , input = ''
    if (arguments.length < 2) editing = false
    if (editing !== false) input = this.state.value[editing]
    tags[this.state.editing] = this.state.input
    this.setState({value: tags, input: input, focused: !blur, editing: editing})
    if (!this.props.onChange) return
    this.props.onChange(old, tag, function (tags) {
      this.setState({value: tags})
    }.bind(this))
  },
  addTag: function (tag, unfocus, editing) {
    var tags = this.state.value
      , input = ''
    tags.push(tag)
    if (arguments.length < 2) editing = false
    if (editing !== false) input = this.state.value[editing]
    this.setState({value: tags, input: input, focused: !unfocus, editing: editing})
    if (!this.props.onAdd) return
    this.props.onAdd(tag, function (tags) {
      this.setState({value: tags})
    }.bind(this))
  },
  removeTag: function (tag) {
    var tags = this.state.value
      , i = tags.indexOf(tag)
    if (i === -1) return console.warn("Removing a non-existent tag", tag, tags)
    tags.splice(i, 1)
    this.setState({value: tags})
    if (!this.props.onRemove) return
    this.props.onRemove(tag, function (tags) {
      this.setState({value: tags})
    }.bind(this))
  },
  editTag: function (i) {
    this.setState({editing: i, focused: true, input: this.state.value[i]})
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
          style={{}}
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
