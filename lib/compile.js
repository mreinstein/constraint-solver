import * as kiwi from 'kiwi.js'
import { parse } from './grammar.js'


// TODO: modify the input grammar to specify editable variables

var strength = {
	required: kiwi.Strength.required,
	strong: kiwi.Strength.strong,
	medium: kiwi.Strength.medium,
	weak: kiwi.Strength.weak
}


// generate a kiwi solver from a series of linear equations
export default function compile (input) {
	var solver = new kiwi.Solver()
	var vars = { }
	var exprs = { }

	var _c = function (expr) {
		if (exprs[expr])
			return exprs[expr]

		switch(expr.type) {
		    case 'Inequality':
		      var op = (expr.operator == '<=') ? kiwi.Operator.Le : kiwi.Operator.Ge
		      var i = new kiwi.Constraint(_c(expr.left), op, _c(expr.right), strength[expr.strength.toLowerCase()])
		      solver.addConstraint(i)
		      return i

		    case 'Equality':
		      var i = new kiwi.Constraint(_c(expr.left), kiwi.Operator.Eq, _c(expr.right), strength[expr.strength.toLowerCase()])
		      solver.addConstraint(i)
		      return i

		    case 'MultiplicativeExpression':
		      // the right hand side must be a number. determine which one this is
		      var lhs = expr.right.type === 'NumericLiteral' ? _c(expr.left) : _c(expr.right)
		      var rhs = expr.right.type === 'NumericLiteral' ? _c(expr.right) : _c(expr.left)

		      if (expr.operator == '*')
		      	return lhs.multiply(rhs)
		      else
		      	return lhs.divide(rhs)
		   
		    case 'AdditiveExpression':
		      if (expr.operator == '+')
		      	return _c(expr.left).plus(_c(expr.right))
		      else
		      	return _c(expr.left).minus(_c(expr.right))

		    case 'NumericLiteral':
		      return expr.value //new kiwi.Expression(expr.value)

		    case 'Variable':
		      if (!vars[expr.name])
		        vars[expr.name] = new kiwi.Variable(expr.name)
		      return vars[expr.name]

		    case 'UnaryExpression':
		      console.log('UnaryExpression...WTF?')
		      break
		}
	}

	var expressions = parse(input)
	//console.log(JSON.stringify(expressions, null, 2))
	expressions.map(_c)
	return solver
}
