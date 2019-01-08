import * as kiwi from 'kiwi.js'
import isReservedIdentifier from './is-reserved-identifier.js'


function applyOperator (lhs, op, rhs) {
	if (op.name === 'DIVIDE') {
		if (typeof rhs !== 'number')
			throw new Error('right hand side of expression must be number when dividing.')
		return lhs.divide(rhs) // subExpression must be a number in this case
	}
	else if (op.name === 'MULTIPLY') {
		if (typeof rhs !== 'number')
			throw new Error('right hand side of expression must be number when multiplying.')
		return lhs.multiply(rhs)  // subExpression must be a number in this case
	}
	else if (op.name === 'PLUS') {
		return lhs.plus(rhs)
	}
	else if (op.name === 'MINUS') {
		return lhs.minus(rhs)
	}
}


export default function expressionParser (identifiers, tokens) {
	let nextToken, expression, operator
	
	while (nextToken = tokens[0]) {
		if ([ 'LEQUAL', 'GEQUAL', 'EQUALS' ].indexOf(nextToken.name) >= 0)
			break  // equality operators are not part of expressions

		if (nextToken.name === 'IDENTIFIER' && isReservedIdentifier(nextToken.value))
			break  // constraint strengths are not part of expressions

		tokens.shift()

		if (nextToken.name === 'R_PAREN')
			break  // encountered end of expression

		if (nextToken.name === 'L_PAREN') {
			// found a sub expression, add it to this expression
			const subExpression = expressionParser(identifiers, tokens)
			if (!expression) {
				expression = subExpression
			} else {
				if (operator) {
					expression = applyOperator(expression, operator, subExpression)
 					operator = undefined
				} else {
					throw new Error ('encountered 2 expressions without an operator')
				}
			}
		}
		
		else if (nextToken.name === 'IDENTIFIER' && !isReservedIdentifier(nextToken.value)) {
			if (!identifiers[nextToken.value])
				identifiers[nextToken.value] = new kiwi.Variable(nextToken.value)

			const variable = identifiers[nextToken.value]

			if (expression) {
				if (!operator)
					throw new Error('encountered identifier without operator')
				expression = applyOperator(expression, operator, variable) 
				operator = undefined
			}
			else {
				// if the expression is just a variable, don't wrap it in an expression
				const followingToken = tokens[0]
				if (followingToken && [ 'LEQUAL', 'GEQUAL', 'EQUALS' ].indexOf(followingToken.name) >= 0)
					return variable
				else
					expression = new kiwi.Expression(variable)
			}
		}

		else if ([ 'DIVIDE', 'PLUS', 'MINUS', 'MULTIPLY' ].indexOf(nextToken.name) >= 0) {
			operator = nextToken
		}

		else if (nextToken.name === 'NUMBER') {
			const value = parseInt(nextToken.value, 10)
			if (expression) {
				if (operator) {
					expression = applyOperator(expression, operator, value) 
					operator = undefined
				}
				else {
					throw new Error('encountered number without operator')
				}
			} else {
				expression = new kiwi.Expression(value)
			}
		}

		else if (nextToken.name === 'COMMENT') {
			// noop
		}

		else {
			throw new Error('unexpected token. name:' + nextToken.name + ' value:' + nextToken.value)
		}
	}

	return expression
}
