import { fail, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { type GenerateContentCandidate } from '@google-cloud/vertexai';
import { validateTurnstile } from '$lib/api/common/turnstile';
import { mathGuideTextFromImage } from '../../text-from-image/utils';
import { imageAnalyze } from '$lib/api/math-guide/image-analyze';
import type { ImageTextData } from '$lib/types/(view)/common/image';
import { mathGuideImageValidate } from '$lib/api/math-guide/image-validate';
import { IMAGE_DEFAULT_MIME } from '$lib/constants/common/image';
import { REQUEST_IMAGE_BASE64_MAX_SIZE } from '$lib/constants/api/math-guide';

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    if (!await validateTurnstile(platform?.env.CLOUDFLARE_TURNSTILE_SECRET || "", request.headers)) {
        throw fail(403, { message: 'リクエストトークンが不正です。' })
    }

    const requestJson = await request.json() as unknown as Record<string, unknown>
    const imageBase64 = requestJson.imageBase64 as string
    const downscaledImageBase64 = requestJson.downscaledImageBase64 as string

    if (!imageBase64) {
        return fail(400, { message: '画像ファイルが見つかりません。' })
    }

    if (!downscaledImageBase64) {
        return fail(400, { message: '縮小画像ファイルが見つかりません。' })
    }

    if (REQUEST_IMAGE_BASE64_MAX_SIZE < imageBase64.length) {
        return fail(413, { message: `ファイルサイズが ${REQUEST_IMAGE_BASE64_MAX_SIZE / 1024 / 1024 / (4 / 3)} MB を超えています。` });
    }

    let validated = false

    try {
        validated = await mathGuideImageValidate(platform?.env as Env | undefined, downscaledImageBase64)
    } catch (error: any) {
        console.log(error)
        return fail(500, { message: '画像のけんしょうに失敗しました。' })
    }

    if (!validated) {
        return json({ analyzed: {} })
    }

    let detectedText = ''
    try {
        detectedText = await mathGuideTextFromImage(platform?.env as Env | undefined, imageBase64)
    } catch (error: any) {
        console.log(error)
        return fail(500, { message: 'テキストちゅうしゅつに失敗しました。' })
    }

    let candidate: GenerateContentCandidate
    try {
        candidate = await imageAnalyze(platform?.env as Env | undefined, detectedText, downscaledImageBase64)
    } catch (error: any) {
        console.log(error)
        return fail(500, { message: 'API しょり失敗' })
    }

    const jsonStr = candidate.content.parts.map((part) => part.text).join("").replace(/^```json/, "").replace(/```$/, "")
    const analyzed = JSON.parse(jsonStr)

    const imageTextData: ImageTextData = { base64: imageBase64, mime: IMAGE_DEFAULT_MIME }

    return json({ analyzed, imageTextData })
}

