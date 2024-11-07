import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'main.ts',  // Entry point for the plugin
  output: {
    dir: 'build',  // Output directory for bundled files
    format: 'cjs',  // CommonJS format for compatibility with Obsidian
    sourcemap: 'inline',  // Include inline source maps for easier debugging
    exports: 'default'  // Explicitly set the export mode to 'default'
  },
  external: ['obsidian'],  // Do not bundle the Obsidian library
  plugins: [
    nodeResolve(),  // Resolve node modules like tslib
    typescript()  // Use the TypeScript plugin for Rollup
  ],
};