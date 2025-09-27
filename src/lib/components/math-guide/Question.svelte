<script lang="ts">
	import type { MathGuideQuestion } from '$lib/types/(view)/math-guide/question'
	import ClauseParse from './question/read/ClauseParse.svelte'

	const { question }: { question: MathGuideQuestion } = $props()

	let clauseText: string = $state('')

	async function handleClauseParse() {
		clauseText = question.imageWholeText
	}

	function handleDescribe() {}
	function handleSolve() {}
</script>

{#if question.imageWholeText !== question.question}
	<div><small>{question.imageWholeText}</small></div>
{/if}

<h3>問題</h3>
<div>{question.question}</div>

<div>
	<button onclick={handleClauseParse}>にほんご</button>
	<button onclick={() => (clauseText = '')}>Clear</button>
	<button onclick={handleDescribe}>ときかた</button>
	<button onclick={handleSolve}>かいとう</button>
</div>

<ClauseParse text={clauseText} />
