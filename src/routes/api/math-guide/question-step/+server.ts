import type { RequestHandler } from './$types';
import { questionStep } from '$lib/api/math-guide/question-step';

// export const POST: RequestHandler = async ({ params, platform, request }) => {
export const POST: RequestHandler = async ({ request, platform }) => {
    return questionStep(platform?.env as Env | undefined, request.headers, await request.json())
}
