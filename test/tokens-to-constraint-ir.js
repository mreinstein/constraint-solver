import tap      from 'tap'
import ttcir    from '../lib/tokens-to-constraint-ir.js'
import tokenize from './helpers/tokenize.js'


function testBasic () {
	const tokens = tokenize('windowWidth <= modalHeight + 800 required')
	const ir = ttcir(tokens)
	tap.deepEqual(ir, {
		"type": "CONSTRAINT",
		"strength": "required",
		"lhs": {
			"type": "IDENTIFIER",
			"value": "windowWidth"
		},
		"operator": {
			"name": "LEQUAL",
			"value": "<=",
			"pos": 12
		},
		"rhs": {
			"type": "EXPRESSION",
			"arguments": [{
				"type": "IDENTIFIER",
				"value": "modalHeight"
			}, {
				"type": "OPERATOR",
				"value": "PLUS"
			}, {
				"type": "NUMBER",
				"value": 800
			}]
		}
	})
}


function testComments () {
	let tokens = tokenize('windowWidth <= 800 // some comment here')
	let ir = ttcir(tokens)

	tap.deepEqual(ir, {
		"type": "CONSTRAINT",
		"strength": "strong",
		"lhs": {
			"type": "IDENTIFIER",
			"value": "windowWidth"
		},
		"operator": {
			"name": "LEQUAL",
			"value": "<=",
			"pos": 12
		},
		"rhs": {
			"type": "EXPRESSION",
			"arguments": [{
				"type": "NUMBER",
				"value": 800
			}, {
				"type": "COMMENT",
				"value": "// some comment here"
			}]
		}
	})

	tokens = tokenize('  // dedicated comment line  ')
	ir = ttcir(tokens)
	tap.deepEqual(ir, {
		"type": "COMMENT",
		"value": "// dedicated comment line  "
	})
}


export default function test () { 
	testBasic()
	testComments()
	//console.error('ir:', JSON.stringify(ir))
}
