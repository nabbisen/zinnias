export const AI_QUERY_API_INPUT_TEXT_MAXLENGTH = 1000

export const DEFAULT_GENERATIVE_MODEL = 'gemini-2.5-flash-lite'

export const PROMPT_START_WITH_IMAGE = 'あなたは学習教材のページ画像を読み込んでその内容解説を行うプロフェッショナルです。次の画像をもとにタスクを行いなさい。'

export const MATH_PROMPT_START = 'あなたは数学の学習教材の内容解説を子供に向けて行うプロフェッショナルです。次のタスクを行いなさい。'
export const MATH_PROMPT_RESPONSE_FORMAT = '【回答書式】Markdown 形式の文字列。テキスト言語は日本語。 数式および変数は KaTeX 記法で記述する。数式は $$ 囲みでディスプレイ表記にする。LaTeX 記法および MathML 記法は使わない。'
