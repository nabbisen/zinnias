const CLOUDFLARE_TURNSTILE_VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function validateTurnstile(secret: string, headers: Headers): Promise<boolean> {
    const token = headers.get('CF-TURNSTILE-RESPONSE') ?? ""
    const ip = headers.get('CF-Connecting-IP') ||
        headers.get('X-Forwarded-For') ||
        'unknown';
    return validateToken(secret, token, ip)
}

async function validateToken(secret: string, token: string, remoteip: string): Promise<boolean> {
    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);
    formData.append('remoteip', remoteip);

    const response = await fetch(CLOUDFLARE_TURNSTILE_VERIFY_ENDPOINT, {
        method: 'POST',
        body: formData
    })

    try {
        const result = await response.json()
        return (result as any).success as boolean
    } catch (error) {
        // console.error('Turnstile validation error:', error)
        return false
    }
}