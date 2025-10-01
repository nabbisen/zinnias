import { SchemaType, type ResponseSchema } from "@google-cloud/vertexai";
import { PROMPT_RESPONSE_FORMAT } from "../question-step";

export const DESCRIBE_MAX_OUTPUT_TOKENS = 400

export const DESCRIBE_RESPONSE_SCHEMA: ResponseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        given: {
            type: SchemaType.STRING,
            description: '問題設定',
            format: PROMPT_RESPONSE_FORMAT,
        },
        toSolve: {
            type: SchemaType.STRING,
            description: '問われていること',
            format: PROMPT_RESPONSE_FORMAT,
        },
    },
    required: ['given', 'toSolve'],
}
