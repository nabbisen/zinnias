<script lang="ts">
	import { postJson } from '$lib/(view)/common/api'
	import {
		IMAGE_BRIGHTNESS_FACTOR,
		IMAGE_CONTRAST_FACTOR,
		IMAGE_DEFAULT_MIME,
		IMAGE_MAX_DIMENSION,
		IMAGE_VERTEX_DIMENSION_UNIT,
	} from '$lib/constants/common/image'
	import { messages } from '$lib/stores/message-center.svelte'
	import type { ImageTextData } from '$lib/types/(view)/common/image'
	import type { MathImageContent } from '$lib/types/(view)/math-guide/image'
	import type { SelectedImage } from '$lib/types/(view)/math-guide/image-select'
	import { fileToBase64, imageOptimize } from '$lib/utils/(view)/common/image'

	const {
		fileOnchange,
	}: {
		fileOnchange: (
			imageContent: MathImageContent | null,
			imageTextData: ImageTextData | null
		) => void
	} = $props()

	let imageContent: MathImageContent | null = $state(null)
	let imageTextData: ImageTextData | null = $state(null)

	let selectedImage: SelectedImage | null = $state(null)
	let showImageText = $state(false)

	const selectedImageDataUrl = $derived(() => {
		return URL.createObjectURL(selectedImage!.original)
	})

	let fileInput: HTMLInputElement

	function fileUpdate(c: MathImageContent | null, i: ImageTextData | null) {
		if (fileInput && !i) {
			fileInput.value = ''
		}
		imageContent = c
		imageTextData = i
		fileOnchange(c, i)
	}

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

		selectedImage = await formDataImagesFromFile(file)

		imageValidateAnalyze()
	}

	async function imageValidateAnalyze() {
		const requestJson = {
			imageBase64: selectedImage!.originalBase64,
			downscaledImageBase64: selectedImage!.downscaledBase64,
		}

		let responseJson: any
		try {
			responseJson = await postJson('/api/math-guide/image-analyze', requestJson)
		} catch (error) {
			selectedImage = null
			messages.pushError('画像しょり中にエラーが発生しました')
			return
		}

		const validator = responseJson.analyzed as unknown as Record<string, unknown>
		const validated = 0 < Object.keys(validator).length
		if (!validated) {
			selectedImage = null
			fileUpdate(null, null)
			messages.pushError('このがぞうは すうがくのもんだいでは ありません')
			return
		}

		const c = responseJson.analyzed as unknown as MathImageContent

		const i = responseJson.imageTextData as unknown as ImageTextData
		imageTextData = i

		fileUpdate(c, imageTextData)
	}

	async function formDataImagesFromFile(file: File): Promise<SelectedImage> {
		const imageBuffer = await imageOptimize(
			file,
			IMAGE_MAX_DIMENSION,
			IMAGE_MAX_DIMENSION,
			IMAGE_BRIGHTNESS_FACTOR,
			IMAGE_CONTRAST_FACTOR,
			true
		)
		const imageBlob = new Blob([imageBuffer as BlobPart], { type: IMAGE_DEFAULT_MIME })
		const image = new File([imageBlob], 'image.dat')
		const imageBase64 = await fileToBase64(image)

		const downscaledImageBuffer = await imageOptimize(
			image,
			IMAGE_VERTEX_DIMENSION_UNIT,
			IMAGE_VERTEX_DIMENSION_UNIT
		)
		const downscaledImageBlob = new Blob([downscaledImageBuffer as BlobPart], {
			type: IMAGE_DEFAULT_MIME,
		})
		const downscaledImage = new File([downscaledImageBlob], 'downscaledImage.dat')
		const downscaledImageBase64 = await fileToBase64(downscaledImage)

		return {
			original: image,
			originalBase64: imageBase64,
			downscaled: downscaledImage,
			downscaledBase64: downscaledImageBase64,
		} as SelectedImage
	}
</script>

<article>
	<header>
		<input type="file" bind:this={fileInput} onchange={handleFileChange} />
	</header>

	{#if selectedImage}
		<img src={selectedImageDataUrl()} alt="selected optimized" />
	{/if}

	{#if imageContent}
		<label>
			画像からちゅうしゅつしたテキストをひょうじ
			<input type="checkbox" bind:checked={showImageText} />
		</label>
		{#if showImageText}
			<div>{imageContent.leading}</div>
			{#each imageContent.questions as question}
				<div>{question}</div>
			{/each}
			<div>{imageContent.trailing}</div>
			{#if imageContent.hasDiagram}
				<div>(図表あり)</div>
			{/if}
		{/if}

		<footer>
			<button class="outline secondary" onclick={() => imageValidateAnalyze()}>
				さいかいせき
			</button>
		</footer>
	{/if}
</article>
