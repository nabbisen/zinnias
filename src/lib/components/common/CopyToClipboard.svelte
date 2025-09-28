<script lang="ts">
	import { messages } from '$lib/stores/message-center.svelte'

	const { text }: { text: string } = $props()

	async function handleCopy() {
		if (!text) {
			messages.pushError('はりつけるテキストがありません')
			return
		}

		if (await copyToClipboard(text)) {
			messages.pushInfo('クリップボードにコピーしました')
		} else {
			messages.pushError('クリップボードへのコピーがしっぱいしました')
		}
	}

	async function copyToClipboard(text: string): Promise<boolean> {
		try {
			await navigator.clipboard.writeText(text)
			return true
		} catch (_err) {
			return false
		}
	}
</script>

<button class="outline secondary" onclick={handleCopy}>Copy</button>
