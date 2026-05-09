import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    // Output single file for HA card
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'EnergySchedulerCard',
      formats: ['iife'], // Immediately Invoked Function Expression - works in browser
      fileName: () => 'energy-scheduler-card.js',
    },
    // Output to www folder
    outDir: '../custom_components/hacs_energy_scheduler/www',
    emptyOutDir: false,
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    // Bundle everything into one file
    rollupOptions: {
      output: {
        // Ensure single file output
        inlineDynamicImports: true,
        // Don't split chunks
        manualChunks: undefined,
      },
    },
    // Generate source map for debugging
    sourcemap: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
