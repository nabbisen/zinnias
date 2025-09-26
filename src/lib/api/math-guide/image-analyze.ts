import { DEFAULT_GENERATIVE_MODEL } from "$lib/constants/api/math-guide";
import { type GenerateContentCandidate, type Part } from "@google-cloud/vertexai";
import { generativeModel } from ".";

export async function imageAnalyze(platformEnv: Env | undefined, text: string, imageBase64: string): Promise<GenerateContentCandidate> {
    if (!platformEnv || !platformEnv.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        console.error('API 認証情報が設定されていません。');
        throw 'サーバー設定エラー (status: 500)'
    }

    const credentials = JSON.parse(platformEnv.GOOGLE_APPLICATION_CREDENTIALS_JSON);

    const m = generativeModel(credentials, DEFAULT_GENERATIVE_MODEL)

    const prompt: Part[] = [
        { text: '次のテキストを使用して、後述するタスクを行いなさい。' },
        { text: `【テキスト】${text}` },
        { text: 'タスク内容 = 以下の手順を順番に実行して、結果を JSON にして回答としなさい。' },
        { text: '【手順 1】テキストを leading (文字列) / questions (Array) / trailing (文字列) という構造に分割する。テキストに小問が含まれているかどうかで以下のように分岐する。' },
        { text: '【手順 1-1】小問が含まれている場合: 小問部分を小問単位のテキスト群に分割して、questions 要素群とする。' },
        { text: '【手順 1-2】小問が含まれていない場合: questions は空リストとする。' },
        { text: '【手順 2】以下の画像はテキストの関連画像である。画像中に、問題に関わる 図 / 表 / グラフ が含まれているかどうかを判定する。結果の key を hasDiagram, value type は boolean とする。' },
        {
            inlineData: {
                mimeType: "image/webp",
                data: imageBase64,
            },
        },
        { text: '【結果の例 1】小問が含まれている場合: {leading:"...",questions:["(1) ...","(2) ..."],trailing:"",hasDiagram:false}' },
        { text: '【結果の例 2】小問が含まれていない場合: {leading:"...",questions:[],trailing:"",hasDiagram:true}' },
    ]

    const p = {
        contents: [
            {
                role: 'user',
                parts: prompt
            }
        ]
    }

    const result = await m.generateContent(p);

    if (!result.response.candidates) {
        console.error('生成に失敗しました。');
        throw 'サーバー処理エラー (status: 500)'
    }

    return result.response.candidates[0]
}