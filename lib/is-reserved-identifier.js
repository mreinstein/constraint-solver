export default function isReservedIdentifier (identifier) {
	return [ 'required', 'strong', 'medium', 'weak' ].indexOf(identifier) >= 0
}
