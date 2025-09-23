// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        interface Platform {
            env: Env
            cf: CfProperties
            ctx: ExecutionContext
        }
    }

    const turnstile: {
        render: (element: string | HTMLElement, options: object) => string;
        reset: (widgetId?: string) => void;
        getResponse: (widgetId?: string) => string | undefined;
    }
}

interface Env {
    GOOGLE_APPLICATION_CREDENTIALS_JSON: string;
    CLOUDFLARE_TURNSTILE_SECRET: string;
}

export { };