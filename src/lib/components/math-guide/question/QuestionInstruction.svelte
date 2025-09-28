<script lang="ts">
	import Translate from '$lib/components/translate/Translate.svelte'
	import type { MathGuideQuestionInstruction } from '$lib/types/(view)/math-guide/question-step'
	import ClauseParse from '../read/ClauseParse.svelte'

	const { questionInstruction }: { questionInstruction: MathGuideQuestionInstruction } = $props()

	let clauseText: string = $state('')

	function handleClauseParse() {
		clauseText = questionInstruction.instruction
	}
</script>

<blockquote>{questionInstruction.instruction}</blockquote>

<div>
	<button onclick={handleClauseParse}>にほんご</button>
</div>

<ClauseParse text={clauseText} />
{#if clauseText}
	<Translate text={clauseText} renderAsHTML={false} />
{/if}
