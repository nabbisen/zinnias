import { SchemaType, type ResponseSchema } from "@google-cloud/vertexai";
import { PROMPT_RESPONSE_FORMAT } from "../question-step";

export const EXPLAIN_MAX_OUTPUT_TOKENS = 600

export const EXPLAIN_RESPONSE_SCHEMA: ResponseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        approach: {
            type: SchemaType.STRING,
            description: '解答の土台となる戦略・着眼点',
            format: PROMPT_RESPONSE_FORMAT,
        },
        steps: {
            type: SchemaType.STRING,
            description: 'マクロな観点からの解決までの道のり',
            format: PROMPT_RESPONSE_FORMAT,
        },
    },
    required: ['approach', 'steps'],
}
