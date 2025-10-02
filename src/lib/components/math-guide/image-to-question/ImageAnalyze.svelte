<script lang="ts">
	import { postJson } from '$lib/(view)/common/api'
	import { messages } from '$lib/stores/message-center.svelte'
	import type { ImageTextData } from '$lib/types/(view)/common/image'
	import type { MathImageContent } from '$lib/types/(view)/math-guide/image'
	import type { QuestionImage } from '$lib/types/(view)/math-guide/image-select'

	const {
		questionImage,
		questionOnchange,
		clearQuestionImage,
	}: {
		questionImage: QuestionImage
		questionOnchange: (
			imageContent: MathImageContent | null,
			imageTextData: ImageTextData | null
		) => void
		clearQuestionImage: () => void
	} = $props()

	let imageContent: MathImageContent | null = $state(null)
	let imageTextData: ImageTextData | null = $state(null)

	let showImageText = $state(false)

	const questionImageDataUrl = $derived(() => {
		return URL.createObjectURL(questionImage!.original)
	})

	$effect(() => {
		imageValidateAnalyze()
	})

	function fileUpdate(c: MathImageContent | null, i: ImageTextData | null) {
		imageContent = c
		imageTextData = i
		questionOnchange(c, i)
	}

	async function imageValidateAnalyze() {
		const requestJson = {
			imageBase64: questionImage!.originalBase64,
			downscaledImageBase64: questionImage!.downscaledBase64,
		}

		let responseJson: any
		try {
			responseJson = await postJson('/api/math-guide/image-analyze', requestJson)
		} catch (error) {
			clearQuestionImage()
			messages.pushError('画像しょり中にエラーが発生しました')
			return
		}

		const validator = responseJson.analyzed as unknown as Record<string, unknown>
		const validated = 0 < Object.keys(validator).length
		if (!validated) {
			clearQuestionImage()
			fileUpdate(null, null)
			messages.pushError('このがぞうは すうがくのもんだいでは ありません')
			return
		}

		const c = responseJson.analyzed as unknown as MathImageContent

		const i = responseJson.imageTextData as unknown as ImageTextData
		imageTextData = i

		fileUpdate(c, imageTextData)
	}
</script>

{#if questionImage}
	<img src={questionImageDataUrl()} alt="selected optimized" />
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
		<button class="outline secondary" onclick={() => imageValidateAnalyze()}> さいかいせき </button>
	</footer>
{/if}
