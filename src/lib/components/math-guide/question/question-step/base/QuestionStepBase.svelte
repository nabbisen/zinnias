<script lang="ts">
	import { generateQuestionStepText } from '$lib/(view)/math-guide/question-step'
	import CopyToClipboard from '$lib/components/common/CopyToClipboard.svelte'
	import Translate from '$lib/components/translate/Translate.svelte'
	import { messages } from '$lib/stores/message-center.svelte'
	import type { MathGuideQuestionStep } from '$lib/types/(view)/math-guide/question-step'
	import type { MathGuideQuestionStepStage } from '$lib/types/common/math-guide/question-step'
	import { markdownToMathHTML } from '$lib/utils/(view)/math-guide'

	const {
		stepStage,
		questionStep,
	}: { stepStage: MathGuideQuestionStepStage; questionStep: MathGuideQuestionStep | null } =
		$props()

	let generatedText = $state('')
	let generatedTextHTML = $state('')

	$effect(() => {
		if (!questionStep?.question.trim()) return

		generateQuestionStepText(stepStage, questionStep)
			.then((result) => {
				generatedText = result
				markdownToMathHTML(generatedText)
					.then((result) => {
						generatedTextHTML = result
					})
					.catch((error: unknown) => {
						messages.pushError(error)
						return []
					})
			})
			.catch((error: unknown) => {
				messages.pushError(error)
				return []
			})
	})

	async function processTranslatedText(translatedText: string) {
		return await markdownToMathHTML(translatedText)
	}
</script>

{#if generatedTextHTML}
	<div class="markdown-container">
		{@html generatedTextHTML}
	</div>
	<CopyToClipboard text={generatedText} />
	<Translate text={generatedText} {processTranslatedText} renderAsHTML={true} />
{/if}
