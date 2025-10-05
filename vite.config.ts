import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		sveltekit(),
	],
	server: {
		https: {
			key: "./key.pem",
			cert: "./cert.pem",
		},
	},
})
