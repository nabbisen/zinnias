<script lang="ts">
	import type { MathGuideQuestionStep } from '$lib/types/(view)/math-guide/question-step'
	import ClauseParse from '$lib/components/math-guide/read/ClauseParse.svelte'
	import QuestionStepDescribe from './question-step/QuestionStepDescribe.svelte'
	import QuestionStepExplain from './question-step/QuestionStepExplain.svelte'
	import QuestionStepSolve from './question-step/QuestionStepSolve.svelte'
	import { USER_CONTEXT_MAXLENGTH } from '$lib/constants/common/math-guide'

	const { questionStep }: { questionStep: MathGuideQuestionStep } = $props()

	let clauseText: string = $state('')
	let describeQuestionStep: MathGuideQuestionStep | null = $state(null)
	let explainQuestionStep: MathGuideQuestionStep | null = $state(null)
	let solveQuestionStep: MathGuideQuestionStep | null = $state(null)
	let userContext = $state('')

	function handleClauseParse() {
		clauseText = questionStep.question ?? questionStep.imageWholeText
	}

	function handleDescribe() {
		describeQuestionStep = questionStep
	}

	function handleExplain() {
		explainQuestionStep = questionStep
	}

	function handleSolve() {
		solveQuestionStep = questionStep
	}
</script>

<h3>問題</h3>
<blockquote>{questionStep.question}</blockquote>

<div class="nav">
	<div role="group">
		<button onclick={handleClauseParse}>にほんご</button>
		<button onclick={handleDescribe}>だいい</button>
		<button onclick={handleExplain}>ときかた</button>
		<button onclick={handleSolve}>かいとう</button>
	</div>
	<div role="group" class="clear-buttons">
		<button class="outline secondary" onclick={() => (clauseText = '')}>Clear</button>
		<button class="outline secondary" onclick={() => (describeQuestionStep = null)}>Clear</button>
		<button class="outline secondary" onclick={() => (explainQuestionStep = null)}>Clear</button>
		<button class="outline secondary" onclick={() => (solveQuestionStep = null)}>Clear</button>
	</div>
	<textarea bind:value={userContext} maxlength={USER_CONTEXT_MAXLENGTH}></textarea>
</div>

<ClauseParse text={clauseText} />

{#if describeQuestionStep}
	<h3>だいい</h3>
	<QuestionStepDescribe questionStep={describeQuestionStep} />
{/if}

{#if explainQuestionStep}
	<h3>ときかた</h3>
	<QuestionStepExplain questionStep={explainQuestionStep} {userContext} />
{/if}

{#if solveQuestionStep}
	<h3>かいとう</h3>
	<QuestionStepSolve questionStep={solveQuestionStep} {userContext} />
{/if}

<style>
	.nav *[role='group'] {
		gap: 0.4rem;
	}

	.clear-buttons button {
		font-size: 0.8rem;
		padding: 0.7rem 0;
	}
</style>
