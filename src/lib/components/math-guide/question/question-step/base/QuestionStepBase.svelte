<script lang="ts">
	import { generateQuestionStep } from '$lib/(view)/math-guide/question-step'
	import { messages } from '$lib/stores/message-center.svelte'
	import type { MathGuideQuestionStep } from '$lib/types/(view)/math-guide/question-step'
	import type { MathGuideQuestionStepStage } from '$lib/types/common/math-guide/question-step'
	import type { Snippet } from 'svelte'

	const {
		stepStage,
		title,
		submit,
		reset,
		questionStep,
		userContext,
		generationRender,
	}: {
		stepStage: MathGuideQuestionStepStage
		title: string
		submit: boolean
		reset: boolean
		questionStep: MathGuideQuestionStep
		userContext?: string
		generationRender: Snippet<[{ generation: Record<string, unknown> }]>
	} = $props()

	let generation: Record<string, unknown> = $state({})

	$effect(() => {
		if (submit) handleSubmit()
	})

	$effect(() => {
		if (reset) handleReset()
	})

	function handleSubmit() {
		generateQuestionStep(stepStage, questionStep, userContext)
			.then((result) => {
				generation = result
			})
			.catch((error: unknown) => {
				messages.pushError(error)
			})
	}

	function handleReset() {
		generation = {}
	}
</script>

{#if 0 < Object.keys(generation).length}
	<h3>{title}</h3>
	{@render generationRender({ generation })}
{/if}
