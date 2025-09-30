<script lang="ts">
	import type { MathGuideQuestionStep } from '$lib/types/(view)/math-guide/question-step'
	import QuestionStepBase from './base/QuestionStepBase.svelte'

	const {
		questionStep,
		userContext,
	}: { questionStep: MathGuideQuestionStep; userContext?: string } = $props()
</script>

<QuestionStepBase stepStage="solve" {questionStep} {userContext} />
