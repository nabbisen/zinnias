<script lang="ts">
	import { messages } from '$lib/stores/message-center.svelte'
	import { generateEasierExpression } from './utils'

	const PROFICIENCY_LEVELS = [
		{ level: -1, label: 'とてもやさしい' },
		{ level: 5, label: 'N5 やさしい' },
		{ level: 4, label: 'N4 やさしめ' },
		{ level: 3, label: 'N3 ふつう' },
	]

	let text = $state('')
	let proficiencyLevel = $state(PROFICIENCY_LEVELS.find((x) => x.level === 4)!.level)
	let easierExpressionText = $state('')

	async function handleEasierExpression() {
		try {
			easierExpressionText = await generateEasierExpression(text, proficiencyLevel)
		} catch (error) {
			messages.pushError(error as string)
		}
	}
</script>

<h2>やさしい日本語にいいかえ</h2>

<textarea maxlength="500" bind:value={text}></textarea>

<div>
	<select bind:value={proficiencyLevel}>
		{#each PROFICIENCY_LEVELS as p}
			<option value={p.level}>{p.label}</option>
		{/each}
	</select>
	<button onclick={handleEasierExpression} disabled={text.length === 0}>やさしいひょうげん</button>
</div>

{#if easierExpressionText}
	<pre>{easierExpressionText}</pre>
{/if}

<style>
	textarea {
		min-width: 21em;
		min-height: 6em;
		margin-bottom: 0.8rem;
	}

	div {
		display: flex;
		gap: 0.5rem;
	}
</style>
