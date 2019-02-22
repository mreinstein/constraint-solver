import { Strength, Constraint, Operator, Variable, Expression, Solver } from 'kiwi.js';

// modified from https://eli.thegreenplace.net/2013/07/16/hand-written-lexer-in-javascript-compared-to-the-regex-based-ones

const Lexer = function() {
  this.pos = 0;
  this.buf = null;
  this.buflen = 0;

  // Operator table, mapping operator -> token name
  this.optable = {
    '==': 'EQUALS',
    '<=':  'LEQUAL',
    '>=':  'GEQUAL',
    '+':  'PLUS',
    '-':  'MINUS',
    '*':  'MULTIPLY',
    '.':  'PERIOD',
    '\\': 'BACKSLASH',
    ':':  'COLON',
    '%':  'PERCENT',
    '|':  'PIPE',
    '!':  'EXCLAMATION',
    '?':  'QUESTION',
    '#':  'POUND',
    '&':  'AMPERSAND',
    ';':  'SEMI',
    ',':  'COMMA',
    '(':  'L_PAREN',
    ')':  'R_PAREN',
    '<':  'L_ANG',
    '>':  'R_ANG',
    '{':  'L_BRACE',
    '}':  'R_BRACE',
    '[':  'L_BRACKET',
    ']':  'R_BRACKET',
    '=':  'ASSIGNMENT'
  };
};

// Initialize the Lexer's buffer. This resets the lexer's internal
// state and subsequent tokens will be returned starting with the
// beginning of the new buffer.
Lexer.prototype.input = function(buf) {
  this.pos = 0;
  this.buf = buf;
  this.buflen = buf.length;
};

// Get the next token from the current buffer. A token is an object with
// the following properties:
// - name: name of the pattern that this token matched (taken from rules).
// - value: actual string value of the token.
// - pos: offset in the current buffer where the token starts.
//
// If there are no more tokens in the buffer, returns null. In case of
// an error throws Error.
Lexer.prototype.token = function() {
  this._skipnontokens();
  if (this.pos >= this.buflen) {
    return null;
  }

  // The char at this.pos is part of a real token. Figure out which.
  const c = this.buf.charAt(this.pos);

  // '/' is treated specially, because it starts a comment if followed by
  // another '/'. If not followed by another '/', it's the DIVIDE
  // operator.
  if (c === '/') {
    const next_c = this.buf.charAt(this.pos + 1);
    if (next_c === '/') {
      return this._process_comment();
    } else {
      return {name: 'DIVIDE', value: '/', pos: this.pos++};
    }
  } else if (c === '<') {
    const next_c = this.buf.charAt(this.pos + 1);
    if (next_c === '=') {
      this.pos += 2;
      return {name: 'LEQUAL', value: '<=', pos: this.pos - 2 };
    } else {
      return {name: 'L_ANG', value: '<', pos: this.pos++};
    }
  } else if (c === '>') {
    const next_c = this.buf.charAt(this.pos + 1);
    if (next_c === '=') {
      this.pos += 2;
      return {name: 'GEQUAL', value: '>=', pos: this.pos - 2 };
    } else {
      return {name: 'R_ANG', value: '>', pos: this.pos++};
    }
  } else if (c === '=') {
    const next_c = this.buf.charAt(this.pos + 1);
    if (next_c === '=') {
      this.pos += 2;
      return {name: 'EQUALS', value: '==', pos: this.pos - 2 };
    } else {
      return {name: 'ASSIGNMENT', value: '>', pos: this.pos++};
    }
  } else {
    // Look it up in the table of operators
    const op = this.optable[c];
    if (op !== undefined) {
      return {name: op, value: c, pos: this.pos++};
    } else {
      // Not an operator - so it's the beginning of another token.
      if (Lexer._isalpha(c)) {
        return this._process_identifier();
      } else if (Lexer._isdigit(c)) {
        return this._process_number();
      } else if (c === '"') {
        return this._process_quote();
      } else {
        throw Error('Token error at ' + this.pos);
      }
    }
  }
};

Lexer._isnewline = function(c) {
  return c === '\r' || c === '\n';
};

Lexer._isdigit = function(c) {
  return c >= '0' && c <= '9';
};

Lexer._isalpha = function(c) {
  return (c >= 'a' && c <= 'z') ||
         (c >= 'A' && c <= 'Z') ||
         c === '_' || c === '$';
};

Lexer._isalphanum = function(c) {
  return (c >= 'a' && c <= 'z') ||
         (c >= 'A' && c <= 'Z') ||
         (c >= '0' && c <= '9') ||
         c === '_' || c === '$';
};


Lexer.prototype._process_number = function() {
  var endpos = this.pos + 1;

  var encounteredDecimalPoint = false;

  while (endpos < this.buflen &&
         ( Lexer._isdigit(this.buf.charAt(endpos)) || (!encounteredDecimalPoint && this.buf.charAt(endpos) === '.'))
  ) {
    if (this.buf.charAt(endpos) === '.') {
      encounteredDecimalPoint = true;
    }
    endpos++;
  }

  var tok = {
    name: encounteredDecimalPoint ? 'FLOAT' : 'INTEGER',
    value: this.buf.substring(this.pos, endpos),
    pos: this.pos
  };
  this.pos = endpos;
  return tok;
};

Lexer.prototype._process_comment = function() {
  var endpos = this.pos + 2;
  // Skip until the end of the line
  var c = this.buf.charAt(this.pos + 2);
  while (endpos < this.buflen &&
         !Lexer._isnewline(this.buf.charAt(endpos))) {
    endpos++;
  }

  var tok = {
    name: 'COMMENT',
    value: this.buf.substring(this.pos, endpos),
    pos: this.pos
  };
  this.pos = endpos + 1;
  return tok;
};

Lexer.prototype._process_identifier = function() {
  var endpos = this.pos + 1;
  while (endpos < this.buflen &&
         (Lexer._isalphanum(this.buf.charAt(endpos)) || this.buf.charAt(endpos) === '.')
        ) {
    endpos++;
  }

  var tok = {
    name: 'IDENTIFIER',
    value: this.buf.substring(this.pos, endpos),
    pos: this.pos
  };
  this.pos = endpos;
  return tok;
};

Lexer.prototype._process_quote = function() {
  // this.pos points at the opening quote. Find the ending quote.
  var end_index = this.buf.indexOf('"', this.pos + 1);

  if (end_index === -1) {
    throw Error('Unterminated quote at ' + this.pos);
  } else {
    var tok = {
      name: 'QUOTE',
      value: this.buf.substring(this.pos, end_index + 1),
      pos: this.pos
    };
    this.pos = end_index + 1;
    return tok;
  }
};

Lexer.prototype._skipnontokens = function() {
  while (this.pos < this.buflen) {
    var c = this.buf.charAt(this.pos);
    if (c == ' ' || c == '\t' || c == '\r' || c == '\n') {
      this.pos++;
    } else {
      break;
    }
  }
};

function strengthLookup (str) {
	const mappings = {
		required: Strength.required,
		strong: Strength.strong,
		medium: Strength.medium,
		weak: Strength.weak
	};
	return mappings[str]
}

function operatorLookup (str) {
	if (str === '>=')
		return Operator.Ge
	if (str === '<=')
		return Operator.Le
	if (str === '==')
		return Operator.Eq

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
			identifiers[irExpression.value] = new Variable(irExpression.value);
		return identifiers[irExpression.value]
	}

	if (irExpression.type === 'NUMBER')
		return irExpression.value

	let expression, operator;

	for (const argument of irExpression.arguments) {
		const { type, value } = argument;

		if (argument.type === 'IDENTIFIER') {
			if (!identifiers[value])
				identifiers[value] = new Variable(value);
			const variable = identifiers[value];
			if (expression) {
				if (!operator)
					throw new Error('encountered identifier without operator')
				expression = applyOperator(expression, operator, variable); 
				operator = undefined;
			}
			else {
				expression = new Expression(variable);
			}
		}
		else if (argument.type === 'EXPRESSION') {
			if (!expression) {
				expression = irExpressionToKiwi(identifiers, argument);
			} else {
				if (operator) {
					expression = applyOperator(expression, operator, argument);
 					operator = undefined;
				} else {
					throw new Error ('encountered 2 expressions without an operator')
				}
			}
		}

		else if (argument.type === 'OPERATOR') {
			operator = argument.value;
		}

		else if (argument.type === 'NUMBER') {
			if (expression) {
				if (operator) {
					expression = applyOperator(expression, operator, argument.value); 
					operator = undefined;
				}
				else {
					throw new Error('encountered number without operator')
				}
			} else {
				expression = new Expression(argument.value);
			}

			if (operator) {
				expression = applyOperator(expression, operator, argument.value);
				operator = undefined;
			}
		}
	}

	return expression
}



// create a kiwi constraint from an intermediate representation
function irConstraintToKiwi (identifiers, irConstraint) {
	if (irConstraint.type !== 'CONSTRAINT')
		return

	return new Constraint(
		irExpressionToKiwi(identifiers, irConstraint.lhs),
		operatorLookup(irConstraint.operator.value),
		irExpressionToKiwi(identifiers, irConstraint.rhs),
		strengthLookup(irConstraint.strength)
	)
}

function isReservedIdentifier (identifier) {
	return [ 'required', 'strong', 'medium', 'weak' ].indexOf(identifier) >= 0
}

// parse an expression from tokens into an intermediate representation (ir.)
function tokensToIrExpression (tokens) {
	let token;

	const result = {
		type: 'EXPRESSION',
		arguments: [ ]
	};

	while (token = tokens[0]) {
		if ([ 'LEQUAL', 'GEQUAL', 'EQUALS' ].indexOf(token.name) >= 0)
			break  // equality operators are not part of expressions

		if (token.name === 'IDENTIFIER' && isReservedIdentifier(token.value))
			break  // constraint strengths are not part of expressions

		tokens.shift();

		if (token.name === 'R_PAREN')
			break  // encountered end of expression

		if (token.name === 'L_PAREN')
			result.arguments.push(tokensToIrExpression(tokens));

		else if (token.name === 'IDENTIFIER' && !isReservedIdentifier(token.value))
			result.arguments.push({ type: 'IDENTIFIER', value: token.value });

		else if ([ 'DIVIDE', 'PLUS', 'MINUS', 'MULTIPLY' ].indexOf(token.name) >= 0)
			result.arguments.push({ type: 'OPERATOR', value: token.name });

		else if (token.name === 'FLOAT')
			result.arguments.push({ type: 'NUMBER', value: parseFloat(token.value) });

		else if (token.name === 'INTEGER')
			result.arguments.push({ type: 'NUMBER', value: parseInt(token.value, 10) });

		else if (token.name === 'COMMENT')
			result.arguments.push({ type: 'COMMENT', value: token.value });

		else
			throw new Error('unexpected token. name:' + token.name + ' value:' + token.value)
	}

	// expressions only make sense when we have more than 1 argument. we can reduce this to a simpler result
	// e.g., (45) is an expression that can be reduced to 45 (return a NUMBER rather than an expression of [ NUMBER ])
	if (result.arguments.length === 1)
		return result.arguments[0]

	return result
}

// parse a constraint from tokens into an intermediate representation (ir.)
function tokensToIrConstraint (tokens) {
	const constraint = {
		type: 'CONSTRAINT',
		strength: 'strong'
	};

	constraint.lhs = tokensToIrExpression(tokens);
	constraint.operator = tokens.shift();

	// e.g., a comment on a line by itself wont have an operator
	if (!constraint.operator)
		return constraint.lhs

	constraint.rhs = tokensToIrExpression(tokens);
	
	const nextToken = tokens.shift();

	if (nextToken && nextToken.name === 'IDENTIFIER' && isReservedIdentifier(nextToken.value))
		constraint.strength = nextToken.value;

	return constraint
}

function constraints (options={}) {
	const { editableVariables } = options;
	const constraintString = options.constraints || '';

	const l = new Lexer();


	const addConstraint = function (constraintString) {
		l.input(constraintString);

		const tokens = [ ];

		let nextToken;
		while (nextToken = l.token())
			tokens.push(nextToken);

		//console.log('tokens:', JSON.stringify(tokens))

		if (tokens.length) {
			const ir = tokensToIrConstraint(tokens);
			const constraint = irConstraintToKiwi(identifiers, ir);
			if (constraint) {
				constraintMap[constraintString.trim()] = constraint;
				solver.addConstraint(constraint);
			}
		}
	};


	const getValues = function () {
		const result = { };
		for (const variableName in identifiers)
			result[variableName] = identifiers[variableName].value();
		return result
	};


	const removeConstraint = function (constraintString) {
		if (constraintMap[constraintString.trim()]) {
			solver.removeConstraint(constraintMap[constraintString]);
			delete constraintMap[constraintString];
		}
	};


	const suggestValue = function (variableName, value) {
		const v = identifiers[variableName];
		if (v)
			solver.suggestValue(v, value);
	};


	const solver = new Solver();


	const updateVariables = function () {
		solver.updateVariables();
	};

	const constraintMap = { }; // map constraint strings to the instances
	const identifiers = { };  // map variable names to their instances

	editableVariables.forEach(function (editVariable) {
		if (!identifiers[editVariable.name]) {
			const v = new Variable(editVariable.name );
			identifiers[editVariable.name] = v;
			solver.addEditVariable(v, strengthLookup(editVariable.strength));
		}
	});

	constraintString.split('\n').forEach(addConstraint);

	return { addConstraint, getValues, removeConstraint, suggestValue, updateVariables }
}

export default constraints;
