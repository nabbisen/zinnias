<script lang="ts">
	import type { MathGuideQuestionStep } from '$lib/types/(view)/math-guide/question-step'
	import ClauseParse from '$lib/components/math-guide/read/ClauseParse.svelte'
	import QuestionStepDescribe from './question-step/QuestionStepDescribe.svelte'
	import QuestionStepExplain from './question-step/QuestionStepExplain.svelte'
	import QuestionStepSolve from './question-step/QuestionStepSolve.svelte'
	import { USER_CONTEXT_MAXLENGTH } from '$lib/constants/common/math-guide'

	const { questionStep }: { questionStep: MathGuideQuestionStep } = $props()

	let clauseText: string = $state('')
	let describeSubmit = $state(false)
	let describeReset = $state(false)
	let explainSubmit = $state(false)
	let explainReset = $state(false)
	let solveSubmit = $state(false)
	let solveReset = $state(false)
	let userContext = $state('')

	function handleClauseParse() {
		clauseText = questionStep.question ?? questionStep.imageWholeText
	}

	function handleDescribeSubmit() {
		describeSubmit = true
		setTimeout(() => (describeSubmit = false), 3000)
	}

	function handleDescribeReset() {
		describeReset = true
		setTimeout(() => (describeReset = false), 3000)
	}

	function handleExplainSubmit() {
		explainSubmit = true
		setTimeout(() => (explainSubmit = false), 3000)
	}

	function handleExplainReset() {
		explainReset = true
		setTimeout(() => (explainReset = false), 3000)
	}

	function handleSolveSubmit() {
		solveSubmit = true
		setTimeout(() => (solveSubmit = false), 3000)
	}

	function handleSolveReset() {
		solveReset = true
		setTimeout(() => (solveReset = false), 3000)
	}
</script>

<h3>問題</h3>
<blockquote>{questionStep.question}</blockquote>

<div class="nav">
	<div role="group">
		<button onclick={handleClauseParse}>にほんご</button>
		<button onclick={handleDescribeSubmit}>だいい</button>
		<button onclick={handleExplainSubmit}>ときかた</button>
		<button onclick={handleSolveSubmit}>かいとう</button>
	</div>
	<div role="group" class="clear-buttons">
		<button class="outline secondary" onclick={() => (clauseText = '')}>Clear</button>
		<button class="outline secondary" onclick={handleDescribeReset}>Clear</button>
		<button class="outline secondary" onclick={handleExplainReset}>Clear</button>
		<button class="outline secondary" onclick={handleSolveReset}>Clear</button>
	</div>
	<textarea bind:value={userContext} maxlength={USER_CONTEXT_MAXLENGTH}></textarea>
</div>

<ClauseParse text={clauseText} />

<QuestionStepDescribe submit={describeSubmit} reset={describeReset} {questionStep} />

<QuestionStepExplain submit={explainSubmit} reset={explainReset} {questionStep} {userContext} />

<QuestionStepSolve submit={solveSubmit} reset={solveReset} {questionStep} {userContext} />

<style>
	.nav *[role='group'] {
		gap: 0.4rem;
	}

	.clear-buttons button {
		font-size: 0.8rem;
		padding: 0.7rem 0;
	}
</style>
