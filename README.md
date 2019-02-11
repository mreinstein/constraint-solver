# constraint-solver

[![Build Status](https://travis-ci.org/mreinstein/constraint-solver.svg?branch=master)](https://travis-ci.org/mreinstein/constraint-solver)

a cassowary constraint solver. wraps [kiwi.js](https://www.npmjs.com/package/kiwi.js) with better ergonomics.

Declares a mini language to declare constraints in text rather than code.

## example

```javascript
import constraints from 'constraint-solver'


const layout = constraints({
	editableVariables: [
		{
			name: 'window.width', 
			strength: 'strong'
		},
		{
			name: 'window.height', 
			strength: 'strong'
		}
	],
	constraints: `
		modal.width  <= window.width * 0.95   required
		modal.height <= window.height * 0.95  required
		
		modal.left   == (window.width - modal.width) / 2   required
		modal.top    == (window.height - modal.height) / 2 required

		playlist.width  == modal.width / 3
		playlist.height <= videoContainer.height  required
		playlist.top    == modal.top              required
		playlist.left   == modal.left + videoContainer.width

		videoContainer.width  == modal.width * 0.66
		videoContainer.height == modal.height
		videoContainer.top    == modal.top            required
	`
})

layout.suggestValue('window.width', 1024)
layout.suggestValue('window.height', 768)

layout.updateVariables()

console.log(layout.getValues())

/*
{
  window.width: 1024, window.height: 768, modal.width: 972, modal.height: 729, modal.left: 25, modal.top: 19
  modal.width: 972, playlist.height: 729, playlist.left: 667, playlist.top: 19, playlist.width: 324
  videoContainer.height: 729, videoContainer.top: 19, videoContainer.width: 642
}
*/
```


### dynamic constraints

You don't need to declare all of the constraints up front. It's possible to dynamically add/remove constraints from the 
solver at any time:

```javascript
const layout = constraints({
	editableVariables: [ ],
	constraints: 'y == 34'
})

// .. later on

layout.addConstraint('x == y + 45')
layout.addConstraint('z == x * 14.5')

// NOTE: this must match the same exact string used when the constraint was added
layout.removeConstraint('y == 34')

layout.updateVariables()

console.log(layout.getValues())

```


### how it works

```
┌-----------------┐                       ┌----------------------------┐        ┌-----------┐
|input constraints|        ┌-----┐        |intermediate representation |        |ir to kiwi |
|(raw text)       | -----> |Lexer| -----> |(ir) compiler               | -----> |compiler   |
└-----------------┘        └-----┘        └----------------------------┘        └-----------┘
                                             (accepts tokens as input)

```
