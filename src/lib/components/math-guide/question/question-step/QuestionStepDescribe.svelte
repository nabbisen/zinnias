<script lang="ts">
	import type { MathGuideQuestionStep } from '$lib/types/(view)/math-guide/question-step'
	import QuestionStepBase from './base/QuestionStepBase.svelte'

	const { questionStep }: { questionStep: MathGuideQuestionStep } = $props()
</script>

<QuestionStepBase stepStage="describe" {questionStep} />
