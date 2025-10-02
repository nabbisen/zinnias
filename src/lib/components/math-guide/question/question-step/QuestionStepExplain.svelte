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

<QuestionStepBase
	stepStage="explain"
	title="ときかた"
	{submit}
	{reset}
	{questionStep}
	{userContext}
>
	{#snippet generationRender({ generation })}
		{#await markdownToMathHTML(generation.approach as string) then approachHTML}
			<h4>キーポイント</h4>
			<div class="markdown-container">
				{@html approachHTML}
			</div>
			<CopyToClipboard text={generation.approach as string} />
			<Translate text={generation.approach as string} {processTranslatedText} renderAsHTML={true} />
		{/await}
		<hr />
		{#await markdownToMathHTML(generation.steps as string) then stepsHTML}
			<h4>かいとうへのみちのり</h4>
			<div class="markdown-container">
				{@html stepsHTML}
			</div>
			<CopyToClipboard text={generation.steps as string} />
			<Translate text={generation.steps as string} {processTranslatedText} renderAsHTML={true} />
		{/await}
	{/snippet}
</QuestionStepBase>
