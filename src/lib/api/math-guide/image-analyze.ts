import { DEFAULT_GENERATIVE_MODEL } from "$lib/constants/api/math-guide";
import { type GenerateContentCandidate, type Part } from "@google-cloud/vertexai";
import { generativeModel } from ".";
import { IMAGE_DEFAULT_MIME } from "$lib/constants/common/image";

export async function imageAnalyze(platformEnv: Env | undefined, text: string, imageBase64: string): Promise<GenerateContentCandidate> {
    if (!platformEnv || !platformEnv.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        console.error('API 認証情報が設定されていません。');
        throw 'サーバー設定エラー (status: 500)'
    }

    const credentials = JSON.parse(platformEnv.GOOGLE_APPLICATION_CREDENTIALS_JSON);

    const m = generativeModel(credentials, DEFAULT_GENERATIVE_MODEL)

    const prompt: Part[] = [
        { text: '次のテキストと補足の画像を使用して、後述するタスクを行いなさい。' },
        { text: `【テキスト】${text}` },
        { text: '【テキストの補足: 抽出もと画像】画像中に、問題に関わる 図 / 表 / グラフ が含まれているかどうかを判定する。結果の key を hasDiagram, value type は boolean とする。' },
        {
            inlineData: {
                mimeType: IMAGE_DEFAULT_MIME,
                data: imageBase64,
            },
        },
        { text: '【タスク】以下の手順を順番に実行して、結果を JSON にして回答としなさい。回答にあなた自身のメッセージは書かないこと。' },
        { text: '【タスクの前提: "小問" 分割判定基準】仮に (1), (2), ... と番号分けされていても、互いに関連づけられた構成の場合、それ全体を一つの問題とみなす。例えば一つ前の問の答えを使って次の問題を解かせるような構成のことである。 特に図形問題は、小問に分割できない場合がしばしばあるので、要注意 (例えば、相似を証明してから次にそれを利用して面積を求めるような場合、その相似の問題と面積の問題を小問には分割できない)。' },
        { text: '【手順 1】テキストを leading (文字列) / questions (Array) / trailing (文字列) という構造に分割する。テキストに小問が含まれているかどうかで以下のように分岐する。' },
        { text: '【手順 1-1】小問が含まれている場合: 小問部分を小問単位のテキスト群に分割して、questions 要素群とする。' },
        { text: '【手順 1-2】小問が含まれていない場合: questions は空リストとする。' },
        { text: '【手順 2】抽出もと画像中に、問題に関わる 図 / 表 / グラフ が含まれているかどうかを判定する。結果の key を hasDiagram, value type は boolean とする。' },
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