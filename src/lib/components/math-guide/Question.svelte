<script lang="ts">
	import type { MathGuideQuestion } from '$lib/types/(view)/math-guide/question'
	import Describe from './question/Describe.svelte'
	import ClauseParse from './question/read/ClauseParse.svelte'

	const { question }: { question: MathGuideQuestion } = $props()

	let clauseText: string = $state('')
	let describeQuestion: MathGuideQuestion | null = $state(null)

	async function handleClauseParse() {
		clauseText = question.imageWholeText ?? ''
	}

	function handleDescribe() {
		describeQuestion = question
	}
	function handleExplain() {}
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
	<button onclick={handleDescribe}>だいい</button>
	<button onclick={handleExplain}>ときかた</button>
	<button onclick={handleSolve}>かいとう</button>
</div>

<ClauseParse text={clauseText} />
<Describe question={describeQuestion} />
