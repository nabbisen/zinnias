import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { type GenerateContentCandidate } from '@google-cloud/vertexai';
import { validateTurnstile } from '$lib/api/common/turnstile';
import { mathGuideTextFromImage } from '../../text-from-image/utils';
import { imageAnalyze } from '$lib/api/math-guide/image-analyze';
import type { ImageTextData } from '$lib/types/(view)/common/image';
import { mathGuideImageValidate } from '$lib/api/math-guide/image-validate';
import { imageFileToBase64 } from '$lib/utils/api/common/image';
import { IMAGE_DEFAULT_MIME } from '$lib/constants/common/image';

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    if (!await validateTurnstile(platform?.env.CLOUDFLARE_TURNSTILE_SECRET || "", request.headers)) {
        throw json({ error: 'リクエストトークンが不正です。' }, { status: 403 })
    }

    const formData = await request.formData()
    const image = formData.get("image")
    const downscaledImage = formData.get("downscaledImage")

    if (!image || !(image instanceof File)) {
        return json({ error: '画像ファイルが見つからないか、形式が不正です。' }, { status: 400 })
    }

    if (!downscaledImage || !(downscaledImage instanceof File)) {
        return json({ error: '縮小画像ファイルが見つからないか、形式が不正です。' }, { status: 400 })
    }

    const downscaledImageBase64 = await imageFileToBase64(downscaledImage)

    let validated = false

    try {
        validated = await mathGuideImageValidate(platform?.env as Env | undefined, downscaledImageBase64)
    } catch (error: any) {
        console.log(error)
        return json({ error: '画像のけんしょうに失敗しました。' }, { status: 500 })
    }

    if (!validated) {
        return json({ analyzed: {} })
    }

    const imageBase64 = await await imageFileToBase64(image)

    let detectedText = ''
    try {
        detectedText = await mathGuideTextFromImage(platform?.env as Env | undefined, imageBase64)
    } catch (error: any) {
        console.log(error)
        return json({ error: 'テキストちゅうしゅつに失敗しました。' }, { status: 500 })
    }

    let candidate: GenerateContentCandidate
    try {
        candidate = await imageAnalyze(platform?.env as Env | undefined, detectedText, downscaledImageBase64)
    } catch (error: any) {
        console.log(error)
        return json({ error: 'API 処理失敗' }, { status: 500 })
    }

    const jsonStr = candidate.content.parts.map((part) => part.text).join("").replace(/^```json/, "").replace(/```$/, "")
    const analyzed = JSON.parse(jsonStr)

    const imageTextData: ImageTextData = { base64: imageBase64, mime: IMAGE_DEFAULT_MIME }

    return json({ analyzed, imageTextData })
}

