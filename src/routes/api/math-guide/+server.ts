import { json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateTurnstile } from '$lib/utils/turnstile';
import { VertexAI, type Part } from '@google-cloud/vertexai';

const PROCESSORS = ["read", "describe", "solve"]

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    if (!await validateTurnstile(request.headers)) return json({ error: 'リクエストトークンが不正です。' }, { status: 403 });

    const formData = await request.formData()

    const processor = formData.get("processor")?.toString()
    const validateProcessor = processor && PROCESSORS.includes(processor)
    if (!validateProcessor) {
        return json({ error: '不正な処理リクエストです。' }, { status: 400 });
    }

    const image = formData.get("image")

    if (!image || !(image instanceof File)) {
        return json({ error: '画像ファイルが見つからないか、形式が不正です。' }, { status: 400 });
    }

    if (!platform?.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        console.error('API 認証情報が設定されていません。');
        return json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    const credentials = JSON.parse(platform.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

    const vertex_ai = new VertexAI({
        project: credentials.project_id,
        location: credentials.location,
        googleAuthOptions: {
            credentials,
        },
    });

    const generativeModel = vertex_ai.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
    });

    const imageBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

    const inputImagePrompt: Part[] = [
        { text: '【前提】この画像は数学の問題です。' },
        {
            inlineData: {
                mimeType: image.type,
                data: imageBase64,
            },
        },
        { text: '【前提の画像に関する条件】画像が不鮮明あるいはノイズが多いという理由で、問題箇所が不鮮明な場合は、タスクを行わずに、空文字列を回答とする。' },
    ]

    let taskPrompt: Part[] = []
    switch (processor) {
        case 'read': {
            taskPrompt = [
                { text: '【目的】 問題文の日本語を、非日本語話者向けに解説します。すなわち問題文を、ひらがなを交えながら、平易な表現の日本語で解説します。' },
                { text: '【依頼タスク】 次の手順に沿って回答を生成してください。' },
                { text: '【手順 1】 画像からテキストを抽出して問題文を日本語の文章として組み立ててください。単語の間の不自然な空白は削除してください。原文以外の表現を付加してはいけません。図は適宜無視してください。' },
                { text: '【手順 2】 依頼タスク結果 1 の結果テキストを、文脈のブロックあるいは意味のブロックに区切ってください。これを解説の単位にします。' },
                { text: '【手順 3】 区切ったブロックごとに、括弧書きでひらがな読みを添えてください。' },
                { text: '【手順 4】 区切ったブロックごとに、内容を平易な日本語で説明してください。 条件 = ひらがな中心の既述にする。説明に使って良い表現と漢字は、日本語能力試験の N5 まで。 (すなわち N1 から N4 の内容は使用不可)' },
                { text: '【タスク条件 (内容)】 原文内容に忠実に沿うことを重視して、わかりやすく丁寧に説明する。日本語の意味を解説する。題意に少しだけ触れることは許容するが、問題の解法や解答には決して触れない。' },
                { text: '【タスク条件 (書式)】 回答は Markdown 形式で生成する。' },
                { text: '【タスク条件 (原文を引用する箇所)】 引用部分は "> " 始まりを付加する。' },
                { text: '【回答条件】回答は日本語で生成する。回答内容は生成文章のみに限定して、あなた自身のメッセージは含めない。' },
            ];
            break;
        }
        case 'describe': {
            taskPrompt = [
                { text: '次の 2 つを行ってください。' },
                { text: '【依頼タスク 1】 問題文の題意を説明してください。どのような問題条件あるいは前提で、問われているものが何かを解説してください。数学用語は初歩的なものを含めて適宜解説してください。回答のタイトルは「題意 (だいい)」としてください。' },
                { text: '【依頼タスク 2】 問題文の解き方を説明してください。着目するべきポイントがどこであり、どのように解き進めていくべきなのかという方向性を示してください。論理展開は、初学者がわかるように、易しいものにしてください。回答のタイトルは「解き方 (ときかた)」としてください。' },
                { text: '【タスク条件: 内容】最後の答えは書かず、相手に解く余地を残す。原文内容に忠実に沿うことを重視して、わかりやすく丁寧に説明する。' },
                { text: '【タスク条件: 解答書式】Markdown 形式の文字列で回答する。 数式および変数は KaTeX 記法で記述する。数式は $$ 囲みでディスプレイ表記にする。LaTeX 記法および MathML 記法は使わない。' },
                { text: '【回答条件】回答は日本語で生成する。回答内容は生成文章のみに限定して、あなた自身のメッセージは含めない。' },
            ]
            break;
        }
        case 'solve': {
            taskPrompt = [
                { text: '【依頼タスク】 問題の解答を、解答までの道筋とともに、示してください。問題が小問に分かれている場合、小問ごとに解説してください。論理展開は、初学者がわかるように、易しいものにしてください。' },
                { text: '【タスク条件: 解法の選択】初学者向けの標準的な解法が複数ある場合、最も人気のあるものを解説し、かつ、他の解法のヒントを添える。 (標準的な解法が単一の場合は、それだけを解説する。)' },
                { text: '【タスク条件: 回答書式】Markdown 形式の文字列で回答する。 数式および変数は KaTeX 記法で記述する。数式は $$ 囲みでディスプレイ表記にする。LaTeX 記法および MathML 記法は使わない。' },
                { text: '【タスク条件: 回答時留意事項】正確さを重視して、わかりやすく丁寧に説明する。' },
                { text: '【回答条件】回答は日本語で生成する。 回答内容は生成文章のみに限定して、あなた自身のメッセージは含めない。' },
            ]
            break;
        }
    }

    const prompt = {
        contents: [
            {
                role: 'user',
                parts: [
                    ...inputImagePrompt,
                    ...taskPrompt,
                ]
            }
        ]
    }

    const result = await generativeModel.generateContent(prompt);

    if (!result.response.candidates) {
        console.error('生成に失敗しました。');
        return json({ error: 'サーバー処理エラー' }, { status: 500 });
    }
    const generatedText = result.response.candidates[0].content.parts.map((part) => part.text).join("");

    if (!generatedText) {
        console.error('画像読取りに失敗しました。');
        return json({ error: '画像不鮮明' }, { status: 400 });
    }

    return json({ generatedText });
};

// todo: necessay ? can be removed ?
// This handler will respond to PUT, PATCH, DELETE, etc.
export const fallback: RequestHandler = async ({ request }) => {
    return text(`I caught your ${request.method} request!`)
};
