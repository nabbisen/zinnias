<script lang="ts">
	import { compressImage, copyToClipboard } from '$lib/utils/(view)'
	import { marked } from 'marked'
	import { translate } from '$lib/(view)/common/translate'
	import { generateMathGuide, imageValidateAnalyze } from '$lib/(view)/math-guide/image-process'
	import dompurify from 'dompurify'
	import katex from 'katex'
	import { messages } from '$lib/stores/message-center.svelte'
	import Usage from '$lib/components/math-guide/Usage.svelte'
	import Clauses from '$lib/components/math-guide/process/Clauses.svelte'

	let imgSrc = $state('')
	let showImgSrc = $state(false)

	let describeGeneratedText = $state('')
	let describeHTML = $state('')
	let describeTranslateHTML = $state('')
	let solveGeneratedText = $state('')
	let solveHTML = $state('')
	let solveTranslateHTML = $state('')
	let showsUsage = $state(false)

	let selectedFile: File | null = $state(null)

	function handleFileChange(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement
		}
	) {
		if (!e.currentTarget.files) {
			return
		}
		const file = e.currentTarget.files[0]
		selectedFile = file
	}

	function handleMathGuide(processor: string) {
		if (!selectedFile) {
			messages.pushWarn('イメージがえらばれていません')
			return
		}

		const successCallback = (file: File) => {
			compressImageSuccessCallback(file, processor)
		}

		compressImage(selectedFile, successCallback, compressImageErrorCallback)
	}

	async function compressImageSuccessCallback(file: File, processor: string) {
		const compressedReader = new FileReader()
		compressedReader.onload = (e) => {
			const compressedImageUrl = e.target?.result as string
			imgSrc = compressedImageUrl
		}
		compressedReader.readAsDataURL(file)

		let ret: string
		try {
			ret = (await generateMathGuide(file, processor)) as string
		} catch (error) {
			messages.pushError(error as string)
			return
		}

		const retHTML = await markdownToMathHTML(ret)

		switch (processor) {
			case 'describe': {
				describeGeneratedText = ret
				describeHTML = retHTML
				break
			}
			case 'solve': {
				solveGeneratedText = ret
				solveHTML = retHTML
				break
			}
		}
	}

	const KATEX_REGEX = /\$\$[^$]+\$\$|\$[^$]+\$/g

	async function markdownToMathHTML(text: string): Promise<string> {
		let retHTML = dompurify.sanitize(await marked.parse(text))
		retHTML = retHTML.replace(KATEX_REGEX, katexReplace)
		return retHTML
	}

	function katexReplace(matched: string) {
		let displayMode = false
		let latex = ''
		if (matched.startsWith('$$')) {
			latex = matched.slice(2, -2)
			displayMode = true
		} else {
			latex = matched.slice(1, -1)
		}

		let rendered = ''
		try {
			rendered = katex.renderToString(latex, {
				displayMode,
				output: displayMode ? 'mathml' : 'html',
			})
		} catch {
			return matched
		}

		return displayMode
			? `<div class="katex-display">${rendered}</div>`
			: `<span class="katex-inline">${rendered}</span>`
	}

	function compressImageErrorCallback(error: Error) {
		messages.pushError('画像の圧縮中にエラーが発生しました:', error.message)
	}

	function handleDescribeMathGuide() {
		handleMathGuide('describe')
	}

	function handleSolveMathGuide() {
		handleMathGuide('solve')
	}

	async function handleTranslate(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement
		}
	) {
		const processor = e.currentTarget.dataset.processor!
		const targetLanguage = e.currentTarget.dataset.targetLanguage!

		switch (processor) {
			case 'describe': {
				describeTranslateHTML = await markdownToMathHTML(
					await translate(describeGeneratedText, targetLanguage)
				)
				break
			}
			case 'solve': {
				solveTranslateHTML = await markdownToMathHTML(
					await translate(solveGeneratedText, targetLanguage)
				)
				break
			}
			default: {
				messages.pushError('よきせぬエラーです')
				break
			}
		}
	}

	async function handleTextToClipboard(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement
		}
	) {
		const processor = e.currentTarget.dataset.processor!

		let text = ''
		switch (processor) {
			case 'describe': {
				text = describeGeneratedText
				break
			}
			case 'solve': {
				text = solveGeneratedText
				break
			}
			default: {
				messages.pushError('よきせぬエラーです')
				break
			}
		}
		if (!text) {
			messages.pushError('はりつけるテキストがありません')
			return
		}

		if (await copyToClipboard(text)) {
			messages.pushInfo('クリップボードにコピーしました')
		} else {
			messages.pushError('クリップボードへのコピーがしっぱいしました')
		}
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
<div>
	<input type="file" onchange={handleFileChange} />
</div>

<button
	onclick={async () => {
		const ret = await imageValidateAnalyze(selectedFile!)
		console.log(234123, ret)
	}}>かいせき (todo)</button
>

{#if selectedFile}
	<Clauses {selectedFile} />
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
