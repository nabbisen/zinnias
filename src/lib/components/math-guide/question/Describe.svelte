<script lang="ts">
	import { describe } from '$lib/(view)/math-guide/describe'
	import { clauseParse } from '$lib/(view)/math-guide/read/clause'
	import CopyToClipboard from '$lib/components/common/CopyToClipboard.svelte'
	import Translate from '$lib/components/translate/Translate.svelte'
	import { messages } from '$lib/stores/message-center.svelte'
	import type { MathGuideQuestion } from '$lib/types/(view)/math-guide/question'
	import { markdownToMathHTML } from '$lib/utils/(view)/math-guide'

	const { question }: { question: MathGuideQuestion | null } = $props()

	let generatedText = $state('')
	let generatedTextHTML = $state('')

	$effect(() => {
		if (!question?.question.trim()) return

		describe(question)
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
