<script lang="ts">
	import type { MathGuideImageText } from '$lib/types/(view)/math-guide/math-step'

	const { question }: { question: MathGuideImageText } = $props()

	function handleClausesParse() {}
	function handleDescribe() {}
	function handleExplain() {}
</script>

<div>{question.imageWholeText}</div>

<div>
	<button onclick={handleClausesParse}>にほんご</button>
	<button onclick={handleDescribe}>だいい</button>
	<button onclick={handleExplain}>ときかた</button>
</div>
