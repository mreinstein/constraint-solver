import babel    from 'rollup-plugin-babel'
import resolve  from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'


export default {
  external: [ 'kiwi.js' ],
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ]
}
