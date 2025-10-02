<script lang="ts">
	import { messages } from '$lib/stores/message-center.svelte'

	const {
		fileOnchange,
	}: {
		fileOnchange: (file: File) => void
	} = $props()

	async function handleFileChange(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement
		}
	) {
		const files = e.currentTarget.files

		if (!files) {
			return
		}

		if (1 < files.length) {
			messages.pushError('ファイルはひとつだけえらんでください')
			return
		}

		const file = files[0]

		fileOnchange(file)
	}
</script>

<input type="file" onchange={handleFileChange} />
