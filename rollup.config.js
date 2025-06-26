import babel from '@rollup/plugin-babel';

const config = {
  input: 'src/index.js',
  output: {
    dir: 'output',
    format: 'esm'
  },
  external: ['sharp'], //check if this is needed to exclude it https://github.com/rollup/rollup/issues/1256
  plugins: [
    babel({ babelHelpers: 'bundled' })]
};

export default config;