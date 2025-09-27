import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { type GenerateContentCandidate } from '@google-cloud/vertexai';
import { validateTurnstile } from '$lib/api/common/turnstile';
import { mathGuideImageValidate } from '../image-validate/utils';
import sharp from 'sharp';
import { mathGuideTextFromImage } from '../../text-from-image/utils';
import { imageAnalyze } from '$lib/api/math-guide/image-analyze';
import { DEFAULT_IMAGE_MIME, imageOptimize } from '$lib/api/common/image';
import { VERTEX_IMAGE_UNIT } from '$lib/api/common/google-cloud';
import type { ImageTextData } from '$lib/types/(view)/common/image';

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    if (!await validateTurnstile(platform?.env.CLOUDFLARE_TURNSTILE_SECRET || "", request.headers)) {
        throw json({ error: 'リクエストトークンが不正です。' }, { status: 403 })
    }

    const formData = await request.formData()
    const image = formData.get("image")

    if (!image || !(image instanceof File)) {
        return json({ error: '画像ファイルが見つからないか、形式が不正です。' }, { status: 400 })
    }

    const imageBuffer = await imageOptimize(image)

    const compressedImageBase64 = (await sharp(imageBuffer)
        .resize(VERTEX_IMAGE_UNIT, VERTEX_IMAGE_UNIT, { fit: 'inside' })
        .webp({ quality: 80 })
        .toBuffer()).toString("base64")

    let validated = false

    try {
        validated = await mathGuideImageValidate(platform?.env as Env | undefined, compressedImageBase64)
    } catch (error: any) {
        console.log(error)
        return json({ error: '画像のけんしょうに失敗しました。' }, { status: 500 })
    }

    if (!validated) {
        return json({ analyzed: {} })
    }

    const imageBufferBase64 = imageBuffer.toString("base64")

    let detectedText = ''
    try {
        detectedText = await mathGuideTextFromImage(platform?.env as Env | undefined, imageBufferBase64)
    } catch (error: any) {
        console.log(error)
        return json({ error: 'テキストちゅうしゅつに失敗しました。' }, { status: 500 })
    }

    let candidate: GenerateContentCandidate
    try {
        candidate = await imageAnalyze(platform?.env as Env | undefined, detectedText, compressedImageBase64)
    } catch (error: any) {
        console.log(error)
        return json({ error: 'API 処理失敗' }, { status: 500 })
    }

    const jsonStr = candidate.content.parts.map((part) => part.text).join("").replace(/^```json/, "").replace(/```$/, "")
    const analyzed = JSON.parse(jsonStr)

    const imageTextData: ImageTextData = { base64: imageBufferBase64, mime: DEFAULT_IMAGE_MIME }

    return json({ analyzed, imageTextData })
}

