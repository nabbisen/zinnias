<script lang="ts">
	import { describe } from '$lib/(view)/math-guide/describe'
	import CopyToClipboard from '$lib/components/common/CopyToClipboard.svelte'
	import Translate from '$lib/components/translate/Translate.svelte'
	import { messages } from '$lib/stores/message-center.svelte'
	import type { MathGuideQuestionStep } from '$lib/types/(view)/math-guide/math-step'
	import { markdownToMathHTML } from '$lib/utils/(view)/math-guide'

	const { questionStep }: { questionStep: MathGuideQuestionStep | null } = $props()

	let generatedText = $state('')
	let generatedTextHTML = $state('')

	$effect(() => {
		if (!questionStep?.question.trim()) return

		describe(questionStep)
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
</script>

{#if generatedTextHTML}
	<div class="markdown-container">
		{@html generatedTextHTML}
	</div>
	<CopyToClipboard text={generatedText} />
	<Translate />
	<hr />
{/if}
