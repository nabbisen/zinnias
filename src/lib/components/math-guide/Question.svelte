<script lang="ts">
	import type { ImageTextData } from '$lib/types/(view)/common/image'
	import type { MathImageContent } from '$lib/types/(view)/math-guide/image'
	import QuestionInstruction from './question/QuestionInstruction.svelte'
	import QuestionSteps from './question/QuestionSteps.svelte'

	const {
		imageContent,
		imageTextData,
	}: { imageContent: MathImageContent; imageTextData: ImageTextData } = $props()

	const imageWholeText = $derived(
		`${imageContent.leading}\n${imageContent.questions.join('\n')}\n${imageContent.trailing}`
	)
</script>

{#if 0 < imageContent.questions.length}
	{#if imageContent.leading}
		<QuestionInstruction
			questionInstruction={{
				instruction: imageContent.leading,
				imageWholeText,
				image: imageTextData!,
				hasDiagram: imageContent.hasDiagram,
			}}
		/>
	{/if}

	{#each imageContent.questions as question}
		<hr />
		<QuestionSteps
			questionStep={{
				question: question,
				hasDiagram: imageContent.hasDiagram,
				image: imageTextData,
				imageWholeText,
			}}
		/>
	{/each}

	{#if imageContent.leading}
		<QuestionInstruction
			questionInstruction={{
				instruction: imageContent.leading,
				imageWholeText,
				image: imageTextData,
				hasDiagram: imageContent.hasDiagram,
			}}
		/>
	{/if}
{:else}
	<QuestionSteps
		questionStep={{
			question: imageWholeText,
			hasDiagram: imageContent.hasDiagram,
			image: imageTextData,
			imageWholeText: null,
		}}
	/>
{/if}
