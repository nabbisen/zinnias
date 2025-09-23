<script lang="ts">
	import { messages } from '$lib/stores/message-center.svelte'

	function handleRemoveMessage(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement
		}
	) {
		messages.remove(e.currentTarget.dataset.messageId!)
	}
</script>

<div class="messages">
	{#each messages.all as message}
		<div class="message">
			{#if message.level === 'error'}
				<button data-message-id={message.messageId} onclick={handleRemoveMessage}>x</button>
			{/if}
			<div class={`content ${message.level || 'info'}`}>{message.content}</div>
		</div>
	{/each}
</div>

<style>
	.messages {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		display: flex;
		flex-direction: column-reverse;
		gap: 0.8rem;
		font-size: 0.8rem;
		z-index: 30001;
	}

	.message {
		width: 80%;
		min-width: 80vw;
		margin-left: auto;
		margin-right: auto;
		background-color: #ffffffea;
		padding: 0.3rem 0.7rem;
		display: flex;
		gap: 0.7em;
	}

	.content {
		max-width: 30rem;
	}

	.content:not(.error) {
		margin-left: 2.1em;
	}

	.content.info {
		color: #1c42b5;
	}
	.content.warn {
		color: #725210;
	}
	.content.error {
		color: #921735;
	}
</style>
