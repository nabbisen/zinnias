<script lang="ts">
	import { generateEasierExpression } from './utils'

	let msg = $state('')
	let text = $state('')
	let easierExpressionText = $state('')

	async function handleEasierExpression() {
		easierExpressionText = await generateEasierExpression(text)
	}
</script>

<h2>やさしいことばにいいかえ</h2>

{#if msg}
	<p>{msg}</p>
{/if}

<textarea bind:value={text}></textarea>

<div>
	<button onclick={handleEasierExpression}>やさしいひょうげん</button>
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
