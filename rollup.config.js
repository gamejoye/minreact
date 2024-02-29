import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'packages/index.ts',
  external: ['react'],
  output: [{
    file: 'dist/bundle.cjs.js',
    format: 'cjs',
    exports: 'named',
    name: 'minreact',
  },
  {
    file: 'dist/bundle.esm.js',
    format: 'es',
    exports: 'named',
    name: 'minreact',
  },
  {
    file: 'dist/bundle.umd.js',
    format: 'umd',
    exports: 'named',
    name: 'minreact',
    globals: {
      react: 'React'
    }
  }],
  plugins: [
    resolve({ extensions: ['.js', '.ts'] }),
    commonjs(),
    typescript(),
    babel({ babelHelpers: 'bundled' }),
  ]
};
