import tap      from 'tap'
import tteir    from '../lib/tokens-to-expression-ir.js'
import tokenize from './helpers/tokenize.js'


function testBasic () {
	const tokens = tokenize('  45 / 6.2  ')
	const ir = tteir(tokens)

	tap.deepEqual(ir, {
		"type":"EXPRESSION",
		"arguments":[
			{"type":"NUMBER","value": 45},
			{"type":"OPERATOR","value":"DIVIDE"},
			{"type":"NUMBER","value": 6.2 }
		]
	})

	tap.equal(tokens.length, 0, 'consumes all tokens')
}


function testNestedExpression () {
	const tokens = tokenize('(windowWidth - modalWidth + 9.42) / 34')
	const ir = tteir(tokens)

	tap.deepEqual(ir, {
		type: "EXPRESSION",
		arguments: [{
			type: "EXPRESSION",
			arguments: [
				{
					type: "IDENTIFIER",
					value: "windowWidth"
				}, {
					type: "OPERATOR",
					value: "MINUS"
				}, {
					type: "IDENTIFIER",
					value: "modalWidth"
				}, {
					type: "OPERATOR",
					value: "PLUS"
				}, {
					type: "NUMBER",
					value: 9.42
				}
			]
		}, {
			type: "OPERATOR",
			value: "DIVIDE"
		}, {
			type: "NUMBER",
			value: 34
		}]
	})

	tap.equal(tokens.length, 0, 'consumes all tokens')
	tap.equal(ir.arguments[2].value, 34, 'parses as integer')
	tap.equal(ir.arguments[0].arguments[4].value, 9.42, 'parses as float')
}


function testIgnoresWeighting () {
	const tokens = tokenize('videoContainerHeight  required')
	const ir = tteir(tokens)

	tap.deepEqual(ir, {
		"type": "IDENTIFIER",
		"value": "videoContainerHeight"
	})
	tap.deepEqual(tokens, [ { name: 'IDENTIFIER', value: 'required', pos: 22 } ], 'does not consume the weighting token')
}


function testComments () {
	let tokens = tokenize('45 / 6.2 // some comment here')
	let ir = tteir(tokens)

	tap.deepEqual(ir, {
		"type": "EXPRESSION",
		"arguments": [{
			"type": "NUMBER",
			"value": 45
		}, {
			"type": "OPERATOR",
			"value": "DIVIDE"
		}, {
			"type": "NUMBER",
			"value": 6.2
		}, {
			"type": "COMMENT",
			"value": "// some comment here"
		}]
	})

	tokens = tokenize('  // dedicated comment line  ')
	ir = tteir(tokens)
	tap.deepEqual(ir, {
		"type": "COMMENT",
		"value": "// dedicated comment line  "
	})
}


export default function test () { 
	testBasic()
	testNestedExpression()
	testIgnoresWeighting()
	testComments()
	//console.error('ir:', JSON.stringify(ir))
}
