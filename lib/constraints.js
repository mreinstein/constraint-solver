import compile from './compile.js'


export default function constraints (constraintString) {

	const { solver, vars } = compile(constraintString)


	const getValues = function ({ roundToInt } = { }) {
		const result = { }
		for (const variableName in vars)
			result[variableName] = (roundToInt === true) ? Math.round(vars[variableName].value()) : vars[variableName].value()
		return result
	}


	const suggestValue = function (variableName, value) {
		const v = vars[variableName]
		if (v)
			solver.suggestValue(v, value)
	}


	return { getValues, suggestValue, updateVariables: () => solver.updateVariables() }
}
