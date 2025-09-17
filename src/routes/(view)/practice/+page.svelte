<script lang="ts">
	import { compressImage, textFromImage } from './utils'

	let msg = $state('')
	let imgSrc = $state('')
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
		alert('画像の圧縮中にエラーが発生しました。')
	}
</script>

<h2>Practice</h2>

{#if msg}
	<p>{msg}</p>
{/if}

テキストを得る<input type="file" onchange={imageOnchange} />
{#if imgSrc}
	<img src={imgSrc} alt="もとのがぞう" />
{/if}

{#if detectedText}
	<p>{detectedText}</p>
{/if}
