import { DEFAULT_GENERATIVE_MODEL, DEFAULT_MAX_OUTPUT_TOKENS } from "$lib/constants/api/math-guide";
import { PROMPT_START } from "$lib/constants/api/math-guide/image-analyze";
import { IMAGE_DEFAULT_MIME } from "$lib/constants/common/image";
import { VertexAI, type GenerateContentCandidate, type GenerationConfig, type GenerativeModel, type Part } from "@google-cloud/vertexai";
import { fail, json } from "@sveltejs/kit";

export async function generate(platformEnv: Env | undefined, prompt: Part[], generationConfig?: GenerationConfig, maxOutputTokens?: number, model?: string): Promise<GenerateContentCandidate> {
    if (!platformEnv || !platformEnv.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        console.error('API 認証情報が設定されていません。');
        throw fail(500, { message: 'サーバー設定エラー' });
    }

    const credentials = JSON.parse(platformEnv.GOOGLE_APPLICATION_CREDENTIALS_JSON);

    const m = generativeModel(credentials, model)

    const p = {
        contents: [
            {
                role: 'user',
                parts: prompt,
            }
        ],
        generationConfig,
    }

    const result = await m.generateContent(p);

    if (!result.response.candidates) {
        console.error('生成に失敗しました。');
        throw fail(500, { message: 'サーバー処理エラー' });
    }

    return result.response.candidates[0]
}

export async function generateWithImage(platformEnv: Env | undefined, prompt: Part[], imageBase64: string, model?: string): Promise<GenerateContentCandidate> {
    if (!platformEnv || !platformEnv.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        console.error('API 認証情報が設定されていません。');
        throw fail(500, { message: 'サーバー設定エラー' });
    }

    const credentials = JSON.parse(platformEnv.GOOGLE_APPLICATION_CREDENTIALS_JSON);

    const m = generativeModel(credentials, model)

    const generationConfig = {
        temperature: 0.7,
        candidateCount: 1,
    }

    const inputImagePrompt = await imageToInputImagePrompt(imageBase64)

    const p = {
        contents: [
            {
                role: 'user',
                parts: [
                    ...inputImagePrompt,
                    ...prompt,
                ]
            }
        ],
        generationConfig,
    }

    const result = await m.generateContent(p);

    if (!result.response.candidates) {
        console.error('生成に失敗しました。');
        throw json({ error: 'サーバー処理エラー' }, { status: 500 });
    }

    return result.response.candidates[0]
}

export function generativeModel(credentials: Record<string, any>, model?: string): GenerativeModel {
    const vertex_ai = new VertexAI({
        project: credentials.project_id,
        location: credentials.location,
        googleAuthOptions: {
            credentials,
        },
    });

    const generativeModel = vertex_ai.getGenerativeModel({
        model: model || DEFAULT_GENERATIVE_MODEL,
    });

    return generativeModel
}

async function imageToInputImagePrompt(imageBase64: string): Promise<Part[]> {
    const inputImagePrompt: Part[] = [
        { text: PROMPT_START },
        {
            inlineData: {
                mimeType: IMAGE_DEFAULT_MIME,
                data: imageBase64,
            },
        },
    ]

    return inputImagePrompt
}
