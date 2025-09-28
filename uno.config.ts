import { defineConfig } from 'unocss'
import presetWind4 from '@unocss/preset-wind4'
import { presetDaisy } from "@ameinhardt/unocss-preset-daisy";

export default defineConfig({
    presets: [
        presetDaisy({
            themes: [
                "light",
                "dark",
                "sunset",
                "night",
                "abyss",
                "business",
                "coffee",
                "cyberpunk",
                "valentine",
            ],
        }),
        presetWind4(),
    ],
    content: {
        pipeline: {
            include: ["src/**/*.{html,js,ts,svelte,svelte.ts}"],
        },
    },
})