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
	import Question from '$lib/components/math-guide/Question.svelte'
	import ImageText from '$lib/components/math-guide/ImageText.svelte'
	import type { ImageTextData } from '$lib/types/(view)/common/image'

	// let imgSrc = $state('')
	// let showImgSrc = $state(false)

	// let describeGeneratedText = $state('')
	// let describeHTML = $state('')
	// let describeTranslateHTML = $state('')
	// let solveGeneratedText = $state('')
	// let solveHTML = $state('')
	// let solveTranslateHTML = $state('')

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

	// function handleMathGuide(processor: string) {
	// 	if (!file) {
	// 		messages.pushWarn('イメージがえらばれていません')
	// 		return
	// 	}

	// 	const successCallback = (file: File) => {
	// 		compressImageSuccessCallback(file, processor)
	// 	}

	// 	compressImage(file, successCallback, compressImageErrorCallback)
	// }

	// async function compressImageSuccessCallback(file: File, processor: string) {
	// 	const compressedReader = new FileReader()
	// 	compressedReader.onload = (e) => {
	// 		const compressedImageUrl = e.target?.result as string
	// 		imgSrc = compressedImageUrl
	// 	}
	// 	compressedReader.readAsDataURL(file)

	// 	let ret: string
	// 	try {
	// 		ret = (await generateMathGuide(file, processor)) as string
	// 	} catch (error: unknown) {
	//      messages.pushError(error)
	// 		return
	// 	}

	// 	const retHTML = await markdownToMathHTML(ret)

	// 	switch (processor) {
	// 		case 'describe': {
	// 			describeGeneratedText = ret
	// 			describeHTML = retHTML
	// 			break
	// 		}
	// 		case 'solve': {
	// 			solveGeneratedText = ret
	// 			solveHTML = retHTML
	// 			break
	// 		}
	// 	}
	// }

	// function compressImageErrorCallback(error: Error) {
	// 	messages.pushError('画像の圧縮中にエラーが発生しました:', error.message)
	// }

	// function handleDescribeMathGuide() {
	// 	handleMathGuide('describe')
	// }

	// function handleSolveMathGuide() {
	// 	handleMathGuide('solve')
	// }

	// async function handleTranslate(
	// 	e: MouseEvent & {
	// 		currentTarget: EventTarget & HTMLButtonElement
	// 	}
	// ) {
	// 	const processor = e.currentTarget.dataset.processor!
	// 	const targetLanguage = e.currentTarget.dataset.targetLanguage!

	// 	switch (processor) {
	// 		case 'describe': {
	// 			describeTranslateHTML = await markdownToMathHTML(
	// 				await translate(describeGeneratedText, targetLanguage)
	// 			)
	// 			break
	// 		}
	// 		case 'solve': {
	// 			solveTranslateHTML = await markdownToMathHTML(
	// 				await translate(solveGeneratedText, targetLanguage)
	// 			)
	// 			break
	// 		}
	// 		default: {
	// 			messages.pushError('よきせぬエラーです')
	// 			break
	// 		}
	// 	}
	// }

	// async function handleTextToClipboard(
	// 	e: MouseEvent & {
	// 		currentTarget: EventTarget & HTMLButtonElement
	// 	}
	// ) {
	// 	const processor = e.currentTarget.dataset.processor!

	// 	let text = ''
	// 	switch (processor) {
	// 		case 'describe': {
	// 			text = describeGeneratedText
	// 			break
	// 		}
	// 		case 'solve': {
	// 			text = solveGeneratedText
	// 			break
	// 		}
	// 		default: {
	// 			messages.pushError('よきせぬエラーです')
	// 			break
	// 		}
	// 	}
	// 	if (!text) {
	// 		messages.pushError('はりつけるテキストがありません')
	// 		return
	// 	}

	// 	if (await copyToClipboard(text)) {
	// 		messages.pushInfo('クリップボードにコピーしました')
	// 	} else {
	// 		messages.pushError('クリップボードへのコピーがしっぱいしました')
	// 	}
	// }
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
				question: null,
				hasDiagram: imageContent.hasDiagram,
				image: imageTextData!,
				imageWholeText: imageText(),
			}}
		/>
		{#each imageContent.questions as question}
			<hr />
			<Question
				question={{
					question: question,
					hasDiagram: imageContent.hasDiagram,
					image: imageTextData!,
					imageWholeText: imageText(),
				}}
			/>
		{/each}
	{:else}
		<Question
			question={{
				question: imageText(),
				hasDiagram: imageContent.hasDiagram,
				image: imageTextData!,
				imageWholeText: imageText(),
			}}
		/>
	{/if}
{/if}

<!--
{#if file}
	<Clauses {file} />
{/if}

<button onclick={handleDescribeMathGuide}>題意 (だいい) と ときかた</button>
{#if describeGeneratedText}
	<div class="markdown-container">
		{@html describeHTML}
	</div>
	<div>
		<button data-processor="describe" onclick={handleTextToClipboard}>クリップボードにコピー</button
		>
	</div>
	<div>
		<button data-processor="describe" data-target-language="en" onclick={handleTranslate}>
			English
		</button>
		<button data-processor="describe" data-target-language="zh-CN" onclick={handleTranslate}>
			中国語（簡体）
		</button>
	</div>
	{#if describeTranslateHTML}
		<div class="markdown-container">
			{@html describeTranslateHTML}
		</div>
	{/if}
	<hr />
{/if}

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
