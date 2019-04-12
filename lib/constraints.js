import compile        from './compile.js'


export default function constraints (options={}) {
	const { editableVariables } = options
	const constraintString = options.constraints || ''

	// TODO: use the new peg based compiler!

	const addConstraint = function (constraintString) {
		l.input(constraintString)

		const tokens = [ ]

		let nextToken
		while (nextToken = l.token())
			tokens.push(nextToken)

		if (tokens.length) {
			const ir = tokensToIr(tokens)
			const constraint = irToKiwi(identifiers, ir)
			if (constraint) {
				constraintMap[constraintString.trim()] = constraint
				solver.addConstraint(constraint)
			}
		}
	}


	const getValues = function () {
		const result = { }
		for (const variableName in identifiers)
			result[variableName] = identifiers[variableName].value()
		return result
	}


	const removeConstraint = function (constraintString) {
		if (constraintMap[constraintString.trim()]) {
			solver.removeConstraint(constraintMap[constraintString])
			delete constraintMap[constraintString]
		}
		constraintMap[constraintString]
	}


	const suggestValue = function (variableName, value) {
		const v = identifiers[variableName]
		if (v)
			solver.suggestValue(v, value)
	}


	const solver = new kiwi.Solver()


	const updateVariables = function () {
		solver.updateVariables()
	}

	const constraintMap = { } // map constraint strings to the instances
	const identifiers = { }  // map variable names to their instances

	editableVariables.forEach(function (editVariable) {
		if (!identifiers[editVariable.name]) {
			const v = new kiwi.Variable(editVariable.name )
			identifiers[editVariable.name] = v
			solver.addEditVariable(v, strengthLookup(editVariable.strength))
		}
	})

	constraintString.split('\n').forEach(addConstraint)

	return { addConstraint, getValues, removeConstraint, suggestValue, updateVariables }
}
