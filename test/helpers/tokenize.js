import Lexer from '../../lib/lexer.js'


export default function tokenize (input) {
	const l = new Lexer()
	l.input(input)

	const tokens = [ ]

	let nextToken
	while (nextToken = l.token())
		tokens.push(nextToken)

	return tokens
}
