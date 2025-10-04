<script lang="ts">
	import CameraCapture from '$lib/components/common/image/CameraCapture.svelte'
	import ImageCropper from '$lib/components/common/image/ImageCropper.svelte'
	import { dataUrlToFile } from '$lib/utils/(view)/common/image'

	const {
		fileOnchange,
	}: {
		fileOnchange: (file: File) => void
	} = $props()

	let capturedImageDataUrl: string | null = $state(null)
	let croppedImageDataUrl: string | null = $state(null)

	function handleImageCapture(dataUrl: string) {
		capturedImageDataUrl = dataUrl
	}

	function onCrop(dataUrl: string) {
		croppedImageDataUrl = dataUrl
	}

	async function apply() {
		const file = await dataUrlToFile(croppedImageDataUrl!, 'cropped.png')
		fileOnchange(file)
	}

	function reset() {
		croppedImageDataUrl = null
		capturedImageDataUrl = null
	}
</script>

{#if croppedImageDataUrl}
	<div role="group">
		<button onclick={apply}>さいよう</button>
		<a href={croppedImageDataUrl} download="cropped.png" title="ダウンロード">ダウンロード</a>
		<button class="outline" onclick={reset}>やりなおし</button>
	</div>
	<img src={croppedImageDataUrl} alt="capture" />
{:else if capturedImageDataUrl}
	<h3>もんだい文 切り取り</h3>
	<ImageCropper dataUrl={capturedImageDataUrl} {onCrop} {reset} />
{:else}
	<CameraCapture onCapture={handleImageCapture} />
{/if}
