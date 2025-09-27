<script lang="ts">
	import type { MathGuideQuestionInstruction } from '$lib/types/(view)/math-guide/question-step'
	import ClauseParse from '../read/ClauseParse.svelte'

	const { questionInstruction }: { questionInstruction: MathGuideQuestionInstruction } = $props()

	let clauseText: string = $state('')

	function handleClauseParse() {
		clauseText = questionInstruction.instruction
	}
</script>

<div>{questionInstruction.instruction}</div>

<div>
	<button onclick={handleClauseParse}>にほんご</button>
</div>

<ClauseParse text={clauseText} />
