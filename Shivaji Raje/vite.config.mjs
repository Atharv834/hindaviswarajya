import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: { rollupOptions: { input: Object.fromEntries(readdirSync('.').filter(f=>f.endsWith('.html')).map(f=>[f.replace('.html',''),resolve(f)])) } },
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
});
