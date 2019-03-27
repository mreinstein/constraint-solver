import babel   from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve'

export default {
  external: [ 'kiwi.js' ],
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ]
}
