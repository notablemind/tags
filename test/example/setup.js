var StateTagses = React.createClass({
  getInitialState: function () {
    return {
      value: this.props.initialValue || []
    }
  },
  onChange: function (tags) {
    this.setState({value: tags})
  },
  edit: function () {
    this.refs.tags.edit.apply(null, arguments)
  },
  focusEnd: function () {
    this.refs.tags.focusEnd.apply(null, arguments)
  },
  render: function () {
    return this.transferPropsTo(Tags({value: this.state.value, onChange: this.onChange, ref:'tags'}))
  }
})

var Tags = require('tags')
var unstyled = React.renderComponent(StateTagses({
  initialValue: ['one', 'two', 'three', 'four', 'five']
}), document.getElementById('unstyled'))

var tags = React.renderComponent(StateTagses({
  className: 'simple-theme',
  initialValue: ['one', 'two', 'three', 'four', 'five']
}), document.getElementById('place'))


var t1 = StateTagses({
  className: 'simple-theme',
  onNext: function () {
    t2.edit(0)
    return true
  },
  initialValue: ['one', 'two']
})
var t2 = StateTagses({
  className: 'simple-theme',
  onPrev: function () {
    t1.focusEnd()
    return true
  },
  initialValue: ['three', 'four']
})
React.renderComponent(React.DOM.div({}, [
  t1, React.DOM.span({}, ' ---- '), t2
]), document.getElementById('netwalk'))

var log = document.getElementById('output')
React.renderComponent(React.createClass({
  getInitialState: function () {
    return {focused: false}
  },
  render: function () {
    return React.DOM.div({}, [
      StateTagses({
        className: 'simple-theme',
        ref: 'tags',
        initialValue: ['two', 'three', 'four'],
        load: function (done) {
          log.innerHTML += '\n' + 'loading';
          done(['four', 'five'])
        },
        save: function (tags, done) {
          log.innerHTML += '\nsaving: ' + JSON.stringify(tags)
          done(tags)
        }
      }, []),
      React.DOM.button({
        onClick: function () {
          this.refs.tags.focusEnd()
        }.bind(this)
      }, ['FocusMe'])
    ])
  }
})(), document.getElementById('foc'))

