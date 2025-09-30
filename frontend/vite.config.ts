import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: resolve(__dirname, 'src/pages'),
    build: {
        // Output compiled files to 'dist' folder in the root
        outDir: resolve(__dirname, 'dist'), 
        rollupOptions: {
        // Specify all your HTML pages as entry points
        input: {
            index: resolve(__dirname, 'src/pages/index.html'),
            home: resolve(__dirname, 'src/pages/home.html'),
            newCard: resolve(__dirname, 'src/pages/new_card.html'),
        },
        output: {
            // Ensure main.js is placed where your HTML expects it (e.g., 'scripts')
            // This setup works best if we place the output in a 'scripts' folder 
            // relative to the HTML files, or change the HTML script tag.
            assetFileNames: 'assets/[name].[ext]',
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'scripts/[name].js', // This will output your main.ts as scripts/main.js
        },
        },
    },
});