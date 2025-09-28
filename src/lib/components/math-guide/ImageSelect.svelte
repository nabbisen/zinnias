<script lang="ts">
	import { postFormData } from '$lib/(view)/common/api'
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
	import { imageOptimize } from '$lib/utils/(view)/common/image'

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

	let selectedFile: File | null = $state(null)

	const selectedFileDataUrl = $derived(selectedFile && URL.createObjectURL(selectedFile))

	let fileInput: HTMLInputElement

	function fileUpdate(c: MathImageContent | null, i: ImageTextData | null) {
		if (fileInput && !i) {
			fileInput.value = ''
		}
		imageContent = c
		imageTextData = i
		fileOnchange(c, i)
	}

	function handleFileChange(
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

		// imageOptimize(file)
		imageValidateAnalyze(file)
	}

	async function imageValidateAnalyze(file: File) {
		// todo: always optimized...
		const images = await formDataImagesFromFile(file)

		const formData = new FormData()
		formData.append('image', images.image, images.image.name)
		formData.append('downscaledImage', images.downscaledImage, images.downscaledImage.name)

		let responseJson: any
		try {
			responseJson = await postFormData('/api/math-guide/image-analyze', formData)
		} catch (error) {
			messages.pushError('がぞうしょりちゅうにエラーがはっせいしました')
		}

		const validator = responseJson.analyzed as unknown as Record<string, unknown>
		const validated = 0 < Object.keys(validator).length
		if (!validated) {
			fileUpdate(null, null)
			messages.pushError('このがぞうは すうがくのもんだいでは ありません')
		}

		const c = responseJson.analyzed as unknown as MathImageContent

		const i = responseJson.imageTextData as unknown as ImageTextData
		imageTextData = i
		selectedFile = images.image

		fileUpdate(c, imageTextData)
	}

	async function formDataImagesFromFile(
		file: File
	): Promise<{ image: File; downscaledImage: File }> {
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

		const downscaledImageBuffer = await imageOptimize(
			image,
			IMAGE_VERTEX_DIMENSION_UNIT,
			IMAGE_VERTEX_DIMENSION_UNIT
		)
		const downscaledImageBlob = new Blob([downscaledImageBuffer as BlobPart], {
			type: IMAGE_DEFAULT_MIME,
		})
		const downscaledImage = new File([downscaledImageBlob], 'downscaledImage.dat')

		return { image, downscaledImage }
	}
</script>

<div>
	<input type="file" bind:this={fileInput} onchange={handleFileChange} />
</div>

{#if selectedFile}
	<img src={selectedFileDataUrl} alt="selected optimized" />
{/if}

{#if imageContent}
	<div>{imageContent.leading}</div>
	{#each imageContent.questions as question}
		<div>{question}</div>
	{/each}
	<div>{imageContent.trailing}</div>
	{#if imageContent.hasDiagram}
		<div>(図表あり)</div>
	{/if}

	<button onclick={() => imageValidateAnalyze(selectedFile!)}>さいかいせき</button>
{/if}
