import isReservedIdentifier from './is-reserved-identifier.js'


// parse an expression from tokens into an intermediate representation (ir.)
export default function tokensToIrExpression (tokens) {
	let token

	const result = {
		type: 'EXPRESSION',
		arguments: [ ]
	}

	while (token = tokens[0]) {
		if ([ 'LEQUAL', 'GEQUAL', 'EQUALS' ].indexOf(token.name) >= 0)
			break  // equality operators are not part of expressions

		if (token.name === 'IDENTIFIER' && isReservedIdentifier(token.value))
			break  // constraint strengths are not part of expressions

		tokens.shift()

		if (token.name === 'R_PAREN')
			break  // encountered end of expression

		if (token.name === 'L_PAREN')
			result.arguments.push(tokensToIrExpression(tokens))

		else if (token.name === 'IDENTIFIER' && !isReservedIdentifier(token.value))
			result.arguments.push({ type: 'IDENTIFIER', value: token.value })

		else if ([ 'DIVIDE', 'PLUS', 'MINUS', 'MULTIPLY' ].indexOf(token.name) >= 0)
			result.arguments.push({ type: 'OPERATOR', value: token.name })

		else if (token.name === 'FLOAT')
			result.arguments.push({ type: 'NUMBER', value: parseFloat(token.value) })

		else if (token.name === 'INTEGER')
			result.arguments.push({ type: 'NUMBER', value: parseInt(token.value, 10) })

		else if (token.name === 'COMMENT')
			result.arguments.push({ type: 'COMMENT', value: token.value })

		else
			throw new Error('unexpected token. name:' + token.name + ' value:' + token.value)
	}

	// expressions only make sense when we have more than 1 argument. we can reduce this to a simpler result
	// e.g., (45) is an expression that can be reduced to 45 (return a NUMBER rather than an expression of [ NUMBER ])
	if (result.arguments.length === 1)
		return result.arguments[0]

	return result
}
