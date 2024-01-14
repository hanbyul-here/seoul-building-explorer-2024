import { defineConfig } from "vite";
import prefresh from '@prefresh/vite';


export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'preact'`,
  },
  plugins: [prefresh()],
  alias: {
    react: 'preact/compat',
  }
});
