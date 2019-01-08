import resolve from 'rollup-plugin-node-resolve'

export default {
  external: [ 'kiwi.js' ],
  plugins: [
    resolve()
  ]
}
