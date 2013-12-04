/** @jsx React.DOM */

var _ = require('lodash')

var Tags = React.createClass({
  getInitialState: function () {
    var defaultValue = this.props.defaultValue
    return {
      value: defaultValue != null ? defaultValue : [],
      input: '',
      focused: this.props.focused || false
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
    if (e.keyCode === 13 || e.keyCode === 9) {
      this.addTag(this.state.input)
      e.preventDefault()
      return false
    }
  },
  blur: function () {
    if (this.state.input.trim() !== '') {
      this.addTag(this.state.input, true)
    } else {
      this.setState({focused: false})
    }
  },
  focus: function () {
    this.setState({focused: true})
  },
  // add and remove
  addTag: function (tag, unfocus) {
    var tags = this.state.value
    tags.push(tag)
    this.setState({value: tags, input: '', focused: !unfocus})
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
  editTag: function (tag) {
    this.removeTag(tag)
    this.setState({input: tag, focused: true})
  },
  // and the render!
  render: function () {
    var ln = this.state.input.length
    return (
      <div className={'tags ' + this.props.className}>
        {
          this.state.value.map(function (tag) {
            return (
              <div className="tag">
                <span className="text" onClick={this.editTag.bind(this, tag)}>{tag}</span>
                <div className="remove-tag small-btn"
                     onClick={this.removeTag.bind(this, tag)}>&times;</div>
              </div>
            )
          }.bind(this))
        } <span className="plus small-btn"
                style={{display: this.state.focused ? 'none' : 'inline-block'}}
                onClick={this.focus}>+</span>
          <input
            ref="input"
            style={{}}
            onBlur={this.blur}
            style={{
              display: this.state.focused ? 'inline-block' : 'none',
              width: (ln > 3 ? ln : 3)*7 + 20
            }}
            onKeyDown={this.keyDown}
            onChange={this.inputChange}
            value={this.state.input}/>
      </div>
    )
  }
})

module.exports = Tags
