import * as kiwi from 'kiwi.js'


export default function strengthLookup (str) {
	const mappings = {
		required: kiwi.Strength.required,
		strong: kiwi.Strength.strong,
		medium: kiwi.Strength.medium,
		weak: kiwi.Strength.weak
	}
	return mappings[str]
}
