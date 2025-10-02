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
	}: {
		submit: boolean
		reset: boolean
		questionStep: MathGuideQuestionStep
	} = $props()
</script>

<QuestionStepBase stepStage="describe" title="だいい" {submit} {reset} {questionStep}>
	{#snippet generationRender({ generation })}
		{#await markdownToMathHTML(generation.given as string) then givenHTML}
			<h4>もんだいせってい</h4>
			<div class="markdown-container">
				{@html givenHTML}
			</div>
			<CopyToClipboard text={generation.given as string} />
			<Translate text={generation.given as string} {processTranslatedText} renderAsHTML={true} />
		{/await}
		<hr />
		{#await markdownToMathHTML(generation.toSolve as string) then toSolveHTML}
			<h4>とわれていること</h4>
			<div class="markdown-container">
				{@html toSolveHTML}
			</div>
			<CopyToClipboard text={generation.toSolve as string} />
			<Translate text={generation.toSolve as string} {processTranslatedText} renderAsHTML={true} />
		{/await}
		{#if generation.terms && 0 < (generation.terms as unknown[]).length}
			<hr />
			{#each generation.terms as unknown[] as term}
				{term}
			{/each}
		{/if}
	{/snippet}
</QuestionStepBase>
