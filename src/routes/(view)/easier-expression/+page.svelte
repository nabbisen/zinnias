<script lang="ts">
	import { generateEasierExpression } from './utils'

	const PROFICIENCY_LEVELS = [
		{ level: -1, label: 'とてもやさしい' },
		{ level: 5, label: 'N5 やさしい' },
		{ level: 4, label: 'N4 やさしめ' },
		{ level: 3, label: 'N3 ふつう' },
	]

	let msg = $state('')
	let text = $state('')
	let proficiencyLevel = $state(PROFICIENCY_LEVELS.find((x) => x.level === 4)!.level)
	let easierExpressionText = $state('')

	async function handleEasierExpression() {
		easierExpressionText = await generateEasierExpression(text, proficiencyLevel)
	}
</script>

<h2>やさしいことばにいいかえ</h2>

{#if msg}
	<p>{msg}</p>
{/if}

<select bind:value={proficiencyLevel}>
	{#each PROFICIENCY_LEVELS as p}
		<option value={p.level}>{p.label}</option>
	{/each}
</select>

<textarea maxlength="500" bind:value={text}></textarea>

<div>
	<button onclick={handleEasierExpression} disabled={text.length === 0}>やさしいひょうげん</button>
</div>

{#if easierExpressionText}
	<pre>{easierExpressionText}</pre>
{/if}

<style>
	textarea {
		min-width: 21em;
		min-height: 6em;
	}
</style>
