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
			name: 'windowWidth', 
			strength: 'strong'
		},
		{
			name: 'windowHeight', 
			strength: 'strong'
		}
	],
	constraints: `
		modalWidth  <= windowWidth * 0.95   required
		modalHeight <= windowHeight * 0.95  required
		
		modalLeft   == (windowWidth - modalWidth) / 2   required
		modalTop    == (windowHeight - modalHeight) / 2 required

		playlistWidth  == modalWidth / 3
		playlistHeight <= videoContainerHeight  required
		playlistTop    == modalTop              required
		playlistLeft   == modalLeft + videoContainerWidth

		videoContainerWidth  == modalWidth * 0.66
		videoContainerHeight == modalHeight
		videoContainerTop    == modalTop            required
	`
})

layout.suggestValue('windowWidth', 1024)
layout.suggestValue('windowHeight', 768)

layout.updateVariables()

console.log(layout.getValues())

/*
{
  windowWidth: 1024, windowHeight: 768, modalWidth: 972, modalHeight: 729, modalLeft: 25, modalTop: 19
  modalWidth: 972, playlistHeight: 729, playlistLeft: 667, playlistTop: 19, playlistWidth: 324
  videoContainerHeight: 729, videoContainerTop: 19, videoContainerWidth: 642
}
*/
```


### dynamic constraints

You don't need to declare all of the constraints up front. It's possible to dynamically add/remove constraints from the 
solver at any time:

```javascript
const layout = constraints({
	editableVariables: [ ],
	constraints: 'y = 34'
})

// .. later on

layout.addConstraint('x = y + 45')
layout.addConstraint('z = x * 14.5')
layout.removeConstraint('y = 34')

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
