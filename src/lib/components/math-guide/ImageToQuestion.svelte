<script lang="ts">
	import type { ImageTextData } from '$lib/types/(view)/common/image'
	import type { MathImageContent } from '$lib/types/(view)/math-guide/image'
	import ImageAnalyze from './image-to-question/ImageAnalyze.svelte'
	import ImageSelect from './image-to-question/ImageSelect.svelte'
	// import ImageCreate from './image-to-question/ImageCreate.svelte'
	import type { QuestionImage } from '$lib/types/(view)/math-guide/image-select'
	import { fileToQuestionImage } from '$lib/utils/(view)/math-guide/image-to-question'

	const {
		questionOnchange,
	}: {
		questionOnchange: (
			imageContent: MathImageContent | null,
			imageTextData: ImageTextData | null
		) => void
	} = $props()

	let questionImage: QuestionImage | null = $state(null)

	async function fileOnchange(file: File) {
		questionImage = await fileToQuestionImage(file)
	}

	function clearQuestionImage() {
		questionImage = null
	}
</script>

<article>
	<header>
		<ImageSelect {fileOnchange} />
		<!-- <ImageCreate {fileOnchange} /> -->
	</header>

	{#if questionImage}
		<ImageAnalyze {questionImage} {questionOnchange} {clearQuestionImage} />
	{/if}
</article>
