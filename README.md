# constraint-solver

![tests](https://github.com/mreinstein/constraint-solver/actions/workflows/main.yml/badge.svg)


a cassowary constraint solver. wraps [kiwi.js](https://www.npmjs.com/package/kiwi.js) with better ergonomics.

Declares a mini language to declare constraints in text rather than code.

Requires node >= v12.17 or a browser that supports es modules.


## usage

```javascript
import constraints from 'constraint-solver'


const layout = constraints(`
	editable window.width strong
	editable window.height

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
`)

layout.suggestValue('window.width', 1024)
layout.suggestValue('window.height', 768)

layout.updateVariables()

console.log(layout.getValues({ roundToInt: true }))

/*
{
  window.width: 1024,
  window.height: 768,
  modal.width: 972,
  modal.height: 729,
  modal.left: 25,
  modal.top: 19
  playlist.height: 729,
  playlist.left: 667,
  playlist.top: 19,
  playlist.width: 324
  videoContainer.height: 729,
  videoContainer.top: 19,
  videoContainer.width: 642
}
*/
```


### how it works

The language is defined in a pegjs grammar, which generates a parser javascript module. That module is 
capable of taking a string of source code as input, and produces json containing all the parsed tokens.
These tokens are turned into kiwi.js constraints and variables.

```
┌─────────────────┐             ┌────────────────────────────┐  ┌───────────┐
│input constraints│  ┌───────┐  │intermediate representation │  │IR to kiwi │
│(raw text)       ├─▶│ peggy ├─▶│    (IR, in JSON)           ├─▶│solver     │
└─────────────────┘  └───────┘  └────────────────────────────┘  └───────────┘
                                  (accepts tokens as input)
```
