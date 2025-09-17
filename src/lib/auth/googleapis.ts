export async function accessToken(private_key: string, client_email: string): Promise<string> {
    const assertion = await jwt(private_key, client_email)

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion,
        }),
    });

    const data = await response.json();

    return (data as any).access_token
}

async function jwt(private_key: string, client_email: string): Promise<string> {
    const unsignedToken = emailToUnsignedToken(client_email)

    const rawSignature = await signature(private_key, unsignedToken)
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(rawSignature)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    return `${unsignedToken}.${encodedSignature}`
}

async function signature(private_key: string, unsignedToken: string): Promise<ArrayBuffer> {
    const privateKeyJwk = await pemToJwk(private_key)

    return await crypto.subtle.sign(
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256',
        },
        privateKeyJwk,
        new TextEncoder().encode(unsignedToken)
    )
}

async function pemToJwk(pem: string) {
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    const base64 = pem.substring(pemHeader.length + 1, pem.length - pemFooter.length - 1)
        .replace(/\s/g, '');
    const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;

    return crypto.subtle.importKey(
        'pkcs8',
        arrayBuffer,
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256',
        },
        true,
        ['sign']
    )
}

function emailToUnsignedToken(client_email: string): string {
    const header = {
        alg: 'RS256',
        typ: 'JWT',
    };
    const encodedHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    const payload = {
        iss: client_email,
        scope: 'https://www.googleapis.com/auth/cloud-platform',
        aud: 'https://oauth2.googleapis.com/token',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
    };
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    return `${encodedHeader}.${encodedPayload}`
}