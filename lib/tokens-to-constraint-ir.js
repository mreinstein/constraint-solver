import isReservedIdentifier from './is-reserved-identifier.js'
import toExpressionIR       from './tokens-to-expression-ir.js'


// parse a constraint from tokens into an intermediate representation (ir.)
export default function tokensToIrConstraint (tokens) {
	const constraint = {
		type: 'CONSTRAINT',
		strength: 'strong'
	}

	constraint.lhs = toExpressionIR(tokens)
	constraint.operator = tokens.shift()

	// e.g., a comment on a line by itself wont have an operator
	if (!constraint.operator)
		return constraint.lhs

	constraint.rhs = toExpressionIR(tokens)
	
	const nextToken = tokens.shift()

	if (nextToken && nextToken.name === 'IDENTIFIER' && isReservedIdentifier(nextToken.value))
		constraint.strength = nextToken.value

	return constraint
}
