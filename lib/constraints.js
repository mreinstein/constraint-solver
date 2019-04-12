import compile        from './compile.js'


export default function constraints (constraintString) {

	const { solver, vars } = compile(constraintString)


	const getValues = function () {
		const result = { }
		for (const variableName in vars)
			result[variableName] = vars[variableName].value()
		return result
	}


	const suggestValue = function (variableName, value) {
		const v = vars[variableName]
		if (v)
			solver.suggestValue(v, value)
	}


	return { getValues, suggestValue, updateVariables: solver.updateVariables }
}
