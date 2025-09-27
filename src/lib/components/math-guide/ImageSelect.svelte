<script lang="ts">
	import { postFormData } from '$lib/(view)/common/api'
	import { messages } from '$lib/stores/message-center.svelte'
	import type { ImageTextData } from '$lib/types/(view)/common/image'
	import type { MathImageContent } from '$lib/types/(view)/math-guide/image'
	import { imageTextDataToDataUrl } from '$lib/utils/(view)/common/image'

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

	const imageDataUrl = $derived(imageTextData && imageTextDataToDataUrl(imageTextData))

	let fileInput: HTMLInputElement
	let selectedFile: File | null = null

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
		if (!e.currentTarget.files) {
			return
		}
		const file = e.currentTarget.files[0]

		imageValidateAnalyze(file)
	}

	async function imageValidateAnalyze(file: File) {
		const validateFormData = new FormData()
		validateFormData.append('image', file!, file!.name)

		const responseJson = await postFormData('/api/math-guide/image-analyze', validateFormData)

		const validator = responseJson.analyzed as unknown as Record<string, unknown>
		const validated = 0 < Object.keys(validator).length
		if (!validated) {
			fileUpdate(null, null)
			messages.pushError('このがぞうは すうがくのもんだいでは ありません')
		}

		const c = responseJson.analyzed as unknown as MathImageContent

		const i = responseJson.imageTextData as unknown as ImageTextData
		imageTextData = i
		selectedFile = file

		fileUpdate(c, imageTextData)
	}
</script>

<div>
	<input type="file" bind:this={fileInput} onchange={handleFileChange} />
</div>

{#if imageContent}
	<!-- <div>{imageContent.leading}</div>
	{#each imageContent.questions as question}
		<div>{question}</div>
	{/each}
	<div>{imageContent.trailing}</div>
	{#if imageContent.hasDiagram}
		<div>図表あり</div>
		{#if imageDataUrl}
			<img src={imageDataUrl} alt="diagram" />
		{/if}
	{/if} -->

	<button onclick={() => imageValidateAnalyze(selectedFile!)}>さいかいせき</button>
{/if}
