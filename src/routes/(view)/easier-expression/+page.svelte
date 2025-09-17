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

<button onclick={handleEasierExpression}>やさしいひょうげん</button>

{#if easierExpressionText}
	<pre>{easierExpressionText}</pre>
{/if}
