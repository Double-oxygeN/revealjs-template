import { defineConfig } from 'vite';
import { htmlInjectionPlugin } from 'vite-plugin-html-injection';

export default defineConfig({
    plugins: [
        htmlInjectionPlugin({
            injections: [
                {
                    name: 'slides',
                    path: './src/slides.html',
                    injectTo: 'body'
                }
            ]
        })
    ]
})
