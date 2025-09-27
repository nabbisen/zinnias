<script lang="ts">
	import type { MathGuideQuestionStep } from '$lib/types/(view)/math-guide/math-step'
	import Describe from './question/Describe.svelte'
	import ClauseParse from './read/ClauseParse.svelte'

	const { questionStep }: { questionStep: MathGuideQuestionStep } = $props()

	let clauseText: string = $state('')
	let describeQuestionStep: MathGuideQuestionStep | null = $state(null)

	async function handleClauseParse() {
		clauseText = questionStep.imageWholeText ?? ''
	}

	function handleDescribe() {
		describeQuestionStep = questionStep
	}
	function handleExplain() {}
	function handleSolve() {}
</script>

{#if questionStep.imageWholeText !== questionStep.question}
	<div><small>{questionStep.imageWholeText}</small></div>
{/if}

<h3>問題</h3>
<div>{questionStep.question}</div>

<div>
	<button onclick={handleClauseParse}>にほんご</button>
	<button onclick={() => (clauseText = '')}>Clear</button>
	<button onclick={handleDescribe}>だいい</button>
	<button onclick={handleExplain}>ときかた</button>
	<button onclick={handleSolve}>かいとう</button>
</div>

<ClauseParse text={clauseText} />
<Describe questionStep={describeQuestionStep} />
