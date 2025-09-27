<script lang="ts">
	import { clauseParse } from '$lib/(view)/math-guide/read/clause'
	import { messages } from '$lib/stores/message-center.svelte'
	import type { ClauseItem } from '$lib/types/(view)/math-guide/clause-parse'
	import type { MathGuideQuestion } from '$lib/types/(view)/math-guide/question'
	import Clause from './question/Clause.svelte'

	const { question }: { question: MathGuideQuestion } = $props()

	let clauseText: string | null = $state(null)

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
	<button onclick={handleDescribe}>ときかた</button>
	<button onclick={handleSolve}>かいとう</button>
</div>

{#if clauseText}
	<Clause text={clauseText} />
{/if}
