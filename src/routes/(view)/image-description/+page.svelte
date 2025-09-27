<script lang="ts">
	import { messages } from '$lib/stores/message-center.svelte'
	import { generateImageDescription } from './utils'

	let imgSrc = $state('')
	let showImgSrc = $state(false)
	let imageDescriptionText = $state('')

	function handleImageDescription(e: Event) {
		const files = (e.target as HTMLInputElement).files

		if (!files || files.length === 0) {
			messages.pushWarn('イメージがえらばれていません')
			return
		}

		const file = files[0]
		compressImage(file, compressImageSuccessCallback, compressImageErrorCallback)
	}

	async function compressImageSuccessCallback(file: File) {
		const compressedReader = new FileReader()
		compressedReader.onload = (e) => {
			const compressedImageUrl = e.target?.result as string
			imgSrc = compressedImageUrl
		}
		compressedReader.readAsDataURL(file)

		try {
			imageDescriptionText = await generateImageDescription(file)
		} catch (error: unknown) {
			messages.pushError(error)
		}
	}

	function compressImageErrorCallback(error: Error) {
		messages.pushError('画像の圧縮中にエラーが発生しました:', error.message)
	}

	async function textToClipboard() {
		if (await copyToClipboard(imageDescriptionText)) {
			messages.pushInfo('クリップボードにコピーしました')
		} else {
			messages.pushError('クリップボードへのコピーがしっぱいしました')
		}
	}
</script>

<h2>がぞうをせつめい</h2>

<div>
	せつめいを得る
	<input type="file" onchange={handleImageDescription} />
</div>

{#if imageDescriptionText}
	<pre>{imageDescriptionText}</pre>
	<div>
		<button onclick={textToClipboard}>クリップボードにコピー</button>
	</div>
{/if}

{#if imgSrc}
	<div>
		<label>もとのがぞう<input type="checkbox" bind:checked={showImgSrc} /></label>
	</div>
	{#if showImgSrc}
		<img src={imgSrc} alt="もとのがぞう" />
	{/if}
{/if}
