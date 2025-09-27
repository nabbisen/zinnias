<script lang="ts">
	import type { MathGuideQuestion } from '$lib/types/(view)/math-guide/question'

	const { question }: { question: MathGuideQuestion } = $props()

	function handleClausesParse() {}
	function handleDescribe() {}
</script>

<div>{question.imageText}</div>

<div>
	<button onclick={handleClausesParse}>にほんご</button>
	<button onclick={handleDescribe}>ときかた</button>
</div>
