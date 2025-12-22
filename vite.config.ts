import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'
import devtools from 'solid-devtools/vite'

export default defineConfig({
  plugins: [
    devtools({
      autoname: true,
    }),
    solid(),
    tailwindcss(),
  ],
})
