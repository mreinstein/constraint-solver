# changelog

## 4.0.0
* BREAKING: require node v12.17+
* BREAKING: convert to pure es module
* BREAKING: don't transpile es5 to es6 (assume es6 everywhere now)


## 3.0.2
* fix floating number parsing (https://github.com/mreinstein/constraint-solver/issues/3)


## 3.0.1
* fix strength grammar bug
* update tap dep


## 3.0.0
* BREAKING: bug fixes in peg grammar
* added some unit tests
* support editable variables in constraints
* convert parser to pegjs


## 2.0.0
* BREAKING: transpile es6 to es5


## 1.0.0
* embed kiwi directly in the source code via rollup
* remove old versions of node from testing matrix


## 0.2.0
* allow identifiers to have periods (e.g., modal.width is a valid identifier now)


## 0.1.0
* initial version
