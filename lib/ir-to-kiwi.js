import * as kiwi      from 'kiwi.js'
import strengthLookup from './strength-lookup'


function operatorLookup (str) {
	if (str === '>=')
		return kiwi.Operator.Ge
	if (str === '<=')
		return kiwi.Operator.Le
	if (str === '==')
		return kiwi.Operator.Eq

	throw new Error('unknown lookup:', str)
}


function applyOperator (lhs, op, rhs) {
	if (op === 'DIVIDE') {
		if (typeof rhs !== 'number')
			throw new Error('right hand side of expression must be number when dividing.')
		return lhs.divide(rhs) // subExpression must be a number in this case
	}
	else if (op === 'MULTIPLY') {
		if (typeof rhs !== 'number')
			throw new Error('right hand side of expression must be number when multiplying.')
		return lhs.multiply(rhs)  // subExpression must be a number in this case
	}
	else if (op === 'PLUS') {
		return lhs.plus(rhs)
	}
	else if (op === 'MINUS') {
		return lhs.minus(rhs)
	}
}


// create a kiwi expression from an intermediate representation
function irExpressionToKiwi (identifiers, irExpression) {
	if (irExpression.type === 'IDENTIFIER') {
		if (!identifiers[irExpression.value])
			identifiers[irExpression.value] = new kiwi.Variable(irExpression.value)
		return identifiers[irExpression.value]
	}

	if (irExpression.type === 'NUMBER')
		return irExpression.value

	let expression, operator

	for (const argument of irExpression.arguments) {
		const { type, value } = argument

		if (argument.type === 'IDENTIFIER') {
			if (!identifiers[value])
				identifiers[value] = new kiwi.Variable(value)
			const variable = identifiers[value]
			if (expression) {
				if (!operator)
					throw new Error('encountered identifier without operator')
				expression = applyOperator(expression, operator, variable) 
				operator = undefined
			}
			else {
				expression = new kiwi.Expression(variable)
			}
		}
		else if (argument.type === 'EXPRESSION') {
			if (!expression) {
				expression = irExpressionToKiwi(identifiers, argument)
			} else {
				if (operator) {
					expression = applyOperator(expression, operator, argument)
 					operator = undefined
				} else {
					throw new Error ('encountered 2 expressions without an operator')
				}
			}
		}

		else if (argument.type === 'OPERATOR') {
			operator = argument.value
		}

		else if (argument.type === 'NUMBER') {
			if (expression) {
				if (operator) {
					expression = applyOperator(expression, operator, argument.value) 
					operator = undefined
				}
				else {
					throw new Error('encountered number without operator')
				}
			} else {
				expression = new kiwi.Expression(argument.value)
			}

			if (operator) {
				expression = applyOperator(expression, operator, argument.value)
				operator = undefined
			}
		}
	}

	return expression
}



// create a kiwi constraint from an intermediate representation
export default function irConstraintToKiwi (identifiers, irConstraint) {
	if (irConstraint.type !== 'CONSTRAINT')
		return

	return new kiwi.Constraint(
		irExpressionToKiwi(identifiers, irConstraint.lhs),
		operatorLookup(irConstraint.operator.value),
		irExpressionToKiwi(identifiers, irConstraint.rhs),
		strengthLookup(irConstraint.strength)
	)
}
