<script lang="ts">
	import { postFormData } from '$lib/(view)/common/api'
	import { messages } from '$lib/stores/message-center.svelte'
	import type { MathImageContent } from '$lib/types/(view)/math-guide/image'
	import { compressImage } from '$lib/utils/(view)'
	import { p } from '../../../../.svelte-kit/output/server/chunks'

	const {
		fileOnchange,
	}: { fileOnchange: (file: File | null, imageContent: MathImageContent | null) => void } = $props()

	let imageContent: MathImageContent | null = $state(null)
	let imgSrc: string | null = $state(null)

	let fileInput: HTMLInputElement
	let selectedFile: File | null = null

	function fileUpdate(f: File | null, c: MathImageContent | null) {
		selectedFile = f
		if (fileInput && !f) {
			fileInput.value = ''
		}
		imageContent = c
		fileOnchange(f, c)
	}

	function handleFileChange(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement
		}
	) {
		if (!e.currentTarget.files) {
			return
		}
		const rawFile = e.currentTarget.files[0]

		compressImage(rawFile, compressImageSuccessCallback, compressImageErrorCallback)
	}

	async function compressImageSuccessCallback(file: File) {
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
		fileUpdate(file, c)

		imgSrcUpdate(file)
	}

	function compressImageErrorCallback() {
		fileUpdate(null, null)
		messages.pushError('せんたくされた がぞうの しょきかに しっぱいしました')
	}

	async function imgSrcUpdate(file: File) {
		selectedFile = file

		const reader = new FileReader()
		reader.onload = (e) => {
			imgSrc = e.target?.result as string
		}
		reader.readAsDataURL(file)
	}
</script>

<div>
	<input type="file" bind:this={fileInput} onchange={handleFileChange} />
</div>

{#if imageContent}
	<div>{imageContent.leading}</div>
	{#each imageContent.questions as question}
		<div>{question}</div>
	{/each}
	<div>{imageContent.trailing}</div>
	{#if imageContent.hasDiagram}
		<div>図表あり</div>
		<img src={imgSrc} alt="diagram" />
	{/if}

	<button onclick={() => compressImageSuccessCallback(selectedFile!)}>さいかいせき</button>
{/if}
