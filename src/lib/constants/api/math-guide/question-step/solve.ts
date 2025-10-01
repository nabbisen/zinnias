import { SchemaType, type ResponseSchema, type Schema } from "@google-cloud/vertexai";
import { PROMPT_RESPONSE_FORMAT } from "../question-step";

export const SOLVE_MAX_OUTPUT_TOKENS = 800

export const SOLVE_RESPONSE_SCHEMA: ResponseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        derivation: {
            type: SchemaType.STRING,
            description: '解答に至る導出',
            format: PROMPT_RESPONSE_FORMAT,
        },
        answer: {
            type: SchemaType.STRING,
            description: '解答',
        },
    },
    required: ['derivation'],
}
