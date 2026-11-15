import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/miniAlert.js',
    output: [
      {
        file: 'dist/miniAlert.umd.js',
        format: 'umd',
        name: 'MiniAlert',
        sourcemap: true
      },
      {
        file: 'dist/miniAlert.esm.js',
        format: 'esm',
        sourcemap: true
      },
      {
        file: 'dist/miniAlert.umd.min.js',
        format: 'umd',
        name: 'MiniAlert',
        sourcemap: true,
        plugins: [terser()]
      }
    ]
  }
];
