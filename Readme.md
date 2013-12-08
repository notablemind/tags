
# tags

A react component for managing tags. Has minimalistic styling that's easy to
overwrite.

## Key bindings

#### tab / shift-tab

move to the next / previous tag. If the current tag is empty, then it
will be removed

#### backspace in an empty tag

remove this tag and go to the previous one

#### return

commit this tag (if it isn't empty) and add another

#### escape

does what you would expect

## Input attributes:

- "focused" - whether it should start focused
- defaultValue - the value to prepopulate with. Use the "load" function to
  get dynamic information
- load(cb(tags)) pass in a getter
- save(tags, cb(tags)) pass in a setter

## Installation

  Install with [component(1)](http://component.io):

    $ component install noteablemind/tags

## License

  MIT
