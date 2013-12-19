var Tags = require('tags')
var tags = React.renderComponent(Tags({
  value: ['one', 'two', 'three', 'four', 'five']
}), document.getElementById('place'))


var t1 = require('tags')({
  onNext: function () {
    t2.edit(0)
    return true
  },
  value: ['one', 'two']
})
var t2 = Tags({
  onPrev: function () {
    t1.focusEnd()
    return true
  },
  value: ['three', 'four']
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
      Tags({
      value: ['two', 'three', 'four'],
      focused: this.state.focused,
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
        this.setState({focused: true})
      }.bind(this)
    }, ['FocusMe'])
    ])
  }
})(), document.getElementById('foc'))
