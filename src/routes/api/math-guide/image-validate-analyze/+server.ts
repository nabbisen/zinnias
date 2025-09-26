import { json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { type Part } from '@google-cloud/vertexai';
import { process } from '$lib/api/math-guide';

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    const formData = await request.formData()
    const image = formData.get("image")

    if (!image || !(image instanceof File)) {
        return json({ error: '画像ファイルが見つからないか、形式が不正です。' }, { status: 400 });
    }

    const prompt: Part[] = [
        { text: 'Step 1. 画像が学習教材の数学の問題かどうかを分析して、それが false である場合、回答を -1 として処理終了。それ以外の場合、次の Step へ進む。' },
        { text: 'Step 2. 問題が小問に分かれているかどうかを分析して、それが true の場合、小問の個数を回答とする。それ以外の場合は 0 を回答とする。' },
        { text: '【Step 2 の補足】例えば問題が (1) (2) (3) と分かれている場合、回答は 3。このような分割が無い場合、回答は 0。' },
        { text: '【回答の書式条件】回答は単一の数値で生成する。それ以外のものは一切出力しない。' },
    ]

    const candidate = await process(platform?.env as Env, request.headers, prompt, image)

    const analyzed = candidate.content.parts[0].text

    return json({ analyzed });
};

// todo: necessay ? can be removed ?
// This handler will respond to PUT, PATCH, DELETE, etc.
export const fallback: RequestHandler = async ({ request }) => {
    return text(`I caught your ${request.method} request!`)
};
