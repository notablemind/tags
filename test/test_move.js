
var expect = require('expect.js')
  , _ = require('lodash')
  , lib = require('../states')

function checkTrans(from, to, fn) {
  var tags = from.value
  delete from.value
  var pres = _.extend({value: tags}, from)
    , res = fn(tags, from) || from
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
    }],
    ['when editing, should remove', {
      value: ['one', 'two'],
      editing: 1,
      input: ''
    }, {
      value: ['one'],
      editing: 0,
      input: 'one'
    }],
    ['when adding and no tags, should noop', {
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
    }],
    ['when adding nothing', {
      value: ['abc'],
      editing: false,
      input: ''
    }, {
      value: ['abc'],
      editing: false,
      input: ''
    }],
    ['when removing', {
      value: ['abc', 'asd'],
      input: '',
      editing: 0
    }, {
      value: ['asd'],
      input: 'asd',
      editing: 0
    }],
    ['when removing from the end', {
      value: ['abc', 'asd'],
      input: '',
      editing: 1
    }, {
      value: ['abc'],
      input: '',
      editing: false
    }],
    ['when changing', {
      value: ['abc', 'def'],
      editing: 0,
      input: 'b'
    }, {
      value: ['b', 'def'],
      editing: 1,
      input: 'def'
    }],
    ['when changing the last', {
      value: ['abc', 'def'],
      editing: 1,
      input: 'e'
    }, {
      value: ['abc', 'e'],
      editing: false,
      input: ''
    }]
  ],

  'shift tab': [
    ['when adding', {
      value: ['a', 'b'],
      input: 'c',
      editing: false
    }, {
      value: ['a', 'b', 'c'],
      input: 'b',
      editing: 1
    }],
    ['when adding nothing', {
      value: ['a', 'b'],
      input: '',
      editing: false
    }, {
      value: ['a', 'b'],
      input: 'b',
      editing: 1
    }],
    ['when removing', {
      value: ['a', 'b', 'c'],
      editing: 1,
      input: ''
    }, {
      value: ['a', 'c'],
      editing: 0,
      input: 'a'
    }],
    ['when removing from the beginning', {
      value: ['a', 'b'],
      editing: 0,
      input: ''
    }, {
      value: ['', 'b'],
      editing: 0,
      input: ''
    }],
    ['when changing', {
      value: ['a', 'b', 'c'],
      editing: 1,
      input: 'd'
    }, {
      value: ['a', 'd', 'c'],
      editing: 0,
      input: 'a'
    }],
    ['when changing the first', {
      value: ['a', 'b', 'c'],
      editing: 0,
      input: 'd'
    }, {
      value: ['d', 'b', 'c'],
      editing: 0,
      input: 'd'
    }],
    ['when adding and there are no tags', {
      value: [],
      editing: false,
      input: 'abc'
    }, {
      value: ['abc'],
      editing: 0,
      input: 'abc'
    }],
    ['when removing and there are no tags', {
      value: [],
      editing: false,
      input: ''
    }, {
      value: [],
      editing: false,
      input: ''
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

