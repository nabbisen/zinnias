<script lang="ts">
	// import { copyToClipboard } from '$lib/utils/(view)'
	// import { translate } from '$lib/(view)/common/translate'
	// import { generateMathGuide } from '$lib/(view)/math-guide/image-process'
	// import { messages } from '$lib/stores/message-center.svelte'
	import Usage from '$lib/components/math-guide/Usage.svelte'
	// import Clauses from '$lib/components/math-guide/process/Clauses.svelte'
	// import { markdownToMathHTML } from '$lib/utils/(view)/math-guide'
	import ImageSelect from '$lib/components/math-guide/ImageSelect.svelte'
	import type { MathImageContent } from '$lib/types/(view)/math-guide/image'
	import ImageText from '$lib/components/math-guide/ImageText.svelte'
	import type { ImageTextData } from '$lib/types/(view)/common/image'
	import QuestionSteps from '$lib/components/math-guide/QuestionSteps.svelte'

	let showsUsage = $state(false)

	let imageTextData: ImageTextData | null = $state(null)

	let imageContent: MathImageContent | null = $state(null)

	const imageText = $derived(() =>
		imageContent
			? `${imageContent.leading}\n${imageContent.questions.join('\n')}\n${imageContent.trailing}`
			: ''
	)

	function fileOnchange(c: MathImageContent | null, i: ImageTextData | null) {
		imageContent = c
		imageTextData = i
	}
</script>

<h2>すうがくをかいせつ</h2>

<label>
	つかいかた
	<input type="checkbox" bind:checked={showsUsage} />
</label>
{#if showsUsage}
	<Usage />
	<input
		style="position: fixed; right: 1rem; top: 1rem; z-index: 20000;"
		type="checkbox"
		bind:checked={showsUsage}
	/>
{/if}

<h3>がぞうをしてい</h3>

<ImageSelect {fileOnchange} />

{#if imageContent}
	<hr />
	{#if 0 < imageContent.questions.length}
		<ImageText
			question={{
				imageWholeText: imageText(),
				image: imageTextData!,
				hasDiagram: imageContent.hasDiagram,
			}}
		/>
		{#each imageContent.questions as question}
			<hr />
			<QuestionSteps
				questionStep={{
					question: question,
					hasDiagram: imageContent.hasDiagram,
					image: imageTextData!,
					imageWholeText: imageText(),
				}}
			/>
		{/each}
	{:else}
		<QuestionSteps
			questionStep={{
				question: imageText(),
				hasDiagram: imageContent.hasDiagram,
				image: imageTextData!,
				imageWholeText: null,
			}}
		/>
	{/if}
{/if}

<!--
<button onclick={handleDescribeMathGuide}>題意 (だいい) と ときかた</button>


<button onclick={handleSolveMathGuide}>解答 (かいとう)</button>
{#if solveGeneratedText}
	<div class="markdown-container">
		{@html solveHTML}
	</div>
	<div>
		<button data-processor="solve" onclick={handleTextToClipboard}>クリップボードにコピー</button>
	</div>
	<div>
		<button data-processor="solve" data-target-language="en" onclick={handleTranslate}>
			English
		</button>
		<button data-processor="solve" data-target-language="zh-CN" onclick={handleTranslate}>
			中国語（簡体）
		</button>
	</div>
	{#if solveTranslateHTML}
		<div class="markdown-container">
			{@html solveTranslateHTML}
		</div>
	{/if}
	<hr />
{/if}

{#if imgSrc}
	<div>
		<label>もとのがぞう<input type="checkbox" bind:checked={showImgSrc} /></label>
	</div>
	{#if showImgSrc}
		<img src={imgSrc} alt="もとのがぞう" />
	{/if}
{/if}
-->
