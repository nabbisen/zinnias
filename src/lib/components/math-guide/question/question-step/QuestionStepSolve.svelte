<script lang="ts">
	import CopyToClipboard from '$lib/components/common/CopyToClipboard.svelte'
	import Translate from '$lib/components/translate/Translate.svelte'
	import type { MathGuideQuestionStep } from '$lib/types/(view)/math-guide/question-step'
	import { markdownToMathHTML, processTranslatedText } from '$lib/utils/(view)/math-guide/question'
	import QuestionStepBase from './base/QuestionStepBase.svelte'

	const {
		submit,
		reset,
		questionStep,
		userContext,
	}: {
		submit: boolean
		reset: boolean
		questionStep: MathGuideQuestionStep
		userContext?: string
	} = $props()
</script>

<QuestionStepBase stepStage="solve" title="かいとう" {submit} {reset} {questionStep} {userContext}>
	{#snippet generationRender({ generation })}
		<h4>答え</h4>
		{generation.answer}
		<hr />
		{#await markdownToMathHTML(generation.derivation as string) then derivationHTML}
			<h4>かいとう</h4>
			<div class="markdown-container">
				{@html derivationHTML}
			</div>
			<CopyToClipboard text={generation.derivation as string} />
			<Translate
				text={generation.derivation as string}
				{processTranslatedText}
				renderAsHTML={true}
			/>
		{/await}
	{/snippet}
</QuestionStepBase>
