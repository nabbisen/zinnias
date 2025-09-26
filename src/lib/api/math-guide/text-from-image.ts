import { accessToken } from '$lib/auth/googleapis';

const API_ENDPOINT = `https://vision.googleapis.com/v1/images:annotate`;

export async function mathGuideTextFromImage(platformEnv: Env | undefined, base64Image: string): Promise<string> {
    if (!platformEnv?.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        console.error('API 認証情報が設定されていません。');
        throw `サーバー設定エラー (status: 500)`
    }

    const credentials = JSON.parse(platformEnv.GOOGLE_APPLICATION_CREDENTIALS_JSON);

    const at = await accessToken(credentials.private_key, credentials.client_email)

    const requestBody = {
        requests: [
            {
                image: {
                    content: base64Image
                },
                features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
            }
        ]
    }

    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${at}`,
        },
        body: JSON.stringify(requestBody)
    }).catch((error) => {
        throw error
    })

    const result = await response.json();

    if (!response.ok) {
        throw `API 呼出し失敗 (status: ${response.status})`
    }

    // todo: type defs for google vision ai api
    const detectedText = (result as any).responses[0].fullTextAnnotation?.pages?.map((page: any) => page.blocks?.map((block: any) => {
        return block.paragraphs?.map((paragraph: any) => {
            return paragraph.words?.map((word: any) => {
                return word.symbols?.map((symbol: any) => symbol.text).join("")
            }).join("")
        }).join(" ")
    })).join(" ")

    return detectedText
}
