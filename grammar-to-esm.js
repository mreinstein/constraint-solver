// this is a (hopefully) temporary step, which converts the parser generated by pegjs from commonjs to esm.
// ideally they would support generating a pure esm build (see https://github.com/pegjs/pegjs/issues/663 )
// until then this should suffice.

import fs from 'fs'


let content = fs.readFileSync('./lib/grammar.js', 'utf8')
	
content = content.replace('"use strict";\n', '')

const idx = content.indexOf('module.exports')
if (idx >= 0)
	content = content.substring(0, idx) + '\nexport { peg$parse as parse, peg$SyntaxError as SyntaxError };\n'

fs.writeFileSync('./lib/grammar.js', content)
