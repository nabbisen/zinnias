<script lang="ts">
	import { compressImage, copyToClipboard } from '$lib/utils'
	import { textFromImage } from './utils'

	let msg = $state('')
	let imgSrc = $state('')
	let showImgSrc = $state(false)
	let detectedText = $state('')

	function imageOnchange(e: Event) {
		const files = (e.target as HTMLInputElement).files

		if (!files || files.length === 0) {
			msg = 'イメージがえらばれていません。'
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

		const ret = await textFromImage(file)
		detectedText = ret
	}

	function compressImageErrorCallback(err: Error) {
		console.error('画像の圧縮中にエラーが発生しました:', err.message)
		msg = '画像の圧縮中にエラーが発生しました。'
	}

	async function textToClipboard() {
		if (await copyToClipboard(detectedText)) {
			msg = 'クリップボードにコピーしました'
		} else {
			msg = 'クリップボードへのコピーがしっぱいしました'
		}
	}
</script>

<h2>がぞうのぶんしょうをしゅとく</h2>

{#if msg}
	<p>{msg}</p>
{/if}

<div>
	がぞうのテキストを得る
	<input type="file" onchange={imageOnchange} />
</div>

{#if detectedText}
	<p>{detectedText}</p>
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
