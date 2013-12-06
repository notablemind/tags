
var expect = require('expect.js')
  , _ = require('lodash')
  , lib = require('../states')

function checkTrans(from, to, fn) {
  var pres = _.extend({}, from)
    , res = fn(from) || from
    , comp = _.extend(pres, res)
  for (var name in to) {
    expect(comp[name]).to.eql(to[name])
  }
}

var cases = {
  'backspace': [
    ['when adding, should edit last', {
      value: ['one', 'two'],
      editing: false,
      input: ''
    }, {
      value: ['one', 'two'],
      editing: 1,
      input: 'two'
    }], ['when editing, should remove', {
      value: ['one', 'two'],
      editing: 1,
      input: ''
    }, {
      value: ['one'],
      editing: 0,
      input: 'one'
    }], ['when adding and no tags, should noop', {
      value: [],
      editing: false,
      input: ''
    }, {
      value: [],
      editing: false,
      input: ''
    }]
  ],

  'blur': [
    ['when adding', {
      value: [],
      input: 'one',
      editing: false
    }, {
      value: ['one'],
      focused: false,
      input: '',
      editing: false
    }],

    ['when editing', {
      value: ['one'],
      input: 'two',
      editing: 0
    }, {
      value: ['two'],
      input: '',
      editing: false,
      focused: false
    }],

    ['when adding nothing', {
      value: ['one', 'two'],
      input: '',
      editing: false
    }, {
      value: ['one', 'two'],
      input: '',
      editing: false,
      focused: false
    }],

    ['when removing', {
      value: ['one', 'two'],
      input: '',
      editing: 1,
    }, {
      value: ['one'],
      input: '',
      editing: false,
      focused: false
    }]

  ],

  'return': [
    ['when adding', {
      value: ['one'],
      input: 'two',
      editing: false
    }, {
      value: ['one', 'two'],
      editing: false,
      input: ''
    }],
    ['when editing', {
      value: ['one', 'two', 'three'],
      input: 'four',
      editing: 1
    }, {
      value: ['one', 'four', 'three'],
      editing: false,
      input: '',
    }]
  ],
  'tab': [
    ['when adding', {
      value: ['1', '2'],
      input: '34',
      editing: false
    }, {
      value: ['1', '2', '34'],
      input: '',
      editing: false
    }]
  ]

}

Object.keys(cases).forEach(function (name) {
  describe(name, function () {
    cases[name].forEach(function (cas) {
      it(cas[0] + ' :: ' + JSON.stringify(cas[1]), function () {
        checkTrans(cas[1], cas[2], lib[name])
      })
    })
  })
})

