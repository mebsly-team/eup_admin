import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';

// ----------------------------------------------------------------------

export default defineConfig({
  optimizeDeps: {
    include: [
      '@emotion/react',
      '@emotion/styled',
      '@mui/material/Tooltip'
    ],
  },
  plugins: [
    react({
      jsxImportSource: '@emotion/react',

    }),
    // checker({
    //   typescript: true,
    //   eslint: {
    //     lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
    //   },
    //   overlay: {
    //     initialIsOpen: false,
    //   },
    // }),
  ],
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
});
