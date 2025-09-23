<script lang="ts">
	import { compressImage, copyToClipboard } from '$lib/utils'
	import { marked } from 'marked'
	import { generateMathGuide, translate } from './utils'
	import dompurify from 'dompurify'
	import katex from 'katex'
	import { messages } from '$lib/stores/message-center.svelte'

	let imgSrc = $state('')
	let showImgSrc = $state(false)
	let readGeneratedTexts = $state('')
	let readHTML = $state('')
	let describeGeneratedTexts = $state('')
	let describeHTML = $state('')
	let describeTranslateHTML = $state('')
	let solveGeneratedTexts = $state('')
	let solveHTML = $state('')
	let solveTranslateHTML = $state('')

	let selectedFile: File | null = null

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
			case 'read': {
				readGeneratedTexts = ret
				readHTML = retHTML
				break
			}
			case 'describe': {
				describeGeneratedTexts = ret
				describeHTML = retHTML
				break
			}
			case 'solve': {
				solveGeneratedTexts = ret
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

	function handleReadMathGuide() {
		handleMathGuide('read')
	}

	function handleDescribeMathGuide() {
		handleMathGuide('describe')
	}

	function handleSolveMathGuide() {
		handleMathGuide('solve')
	}

	async function describeTranslate() {
		describeTranslateHTML = await markdownToMathHTML(
			await translate(describeGeneratedTexts, 'zh-CN')
		)
	}

	async function solveTranslate() {
		solveTranslateHTML = await markdownToMathHTML(await translate(solveGeneratedTexts, 'zh-CN'))
	}

	async function textToClipboard(text: string) {
		if (await copyToClipboard(text)) {
			messages.pushInfo('クリップボードにコピーしました')
		} else {
			messages.pushError('クリップボードへのコピーがしっぱいしました')
		}
	}

	function readTextToClipboard() {
		textToClipboard(readGeneratedTexts)
	}

	function describeTextToClipboard() {
		textToClipboard(describeGeneratedTexts)
	}

	function solveTextToClipboard() {
		textToClipboard(solveGeneratedTexts)
	}
</script>

<h2>すうがくをかいせつ</h2>

<div>
	せつめいを得る
	<input type="file" onchange={handleFileChange} />
</div>

<button onclick={handleReadMathGuide}>もんだいぶん の にほんご</button>
{#if readGeneratedTexts}
	<div class="markdown-container">
		{@html readHTML}
	</div>
	<div>
		<button onclick={readTextToClipboard}>クリップボードにコピー</button>
	</div>
	<hr />
{/if}

<button onclick={handleDescribeMathGuide}>題意 (だいい) と ときかた</button>
{#if describeGeneratedTexts}
	<div class="markdown-container">
		{@html describeHTML}
	</div>
	<div>
		<button onclick={describeTextToClipboard}>クリップボードにコピー</button>
	</div>
	<div>
		<button onclick={describeTranslate}>中国語（簡体）</button>
		{#if describeTranslateHTML}
			<div class="markdown-container">
				{@html describeTranslateHTML}
			</div>
		{/if}
	</div>
	<hr />
{/if}

<button onclick={handleSolveMathGuide}>解答 (かいとう)</button>
{#if solveGeneratedTexts}
	<div class="markdown-container">
		{@html solveHTML}
	</div>
	<div>
		<button onclick={solveTextToClipboard}>クリップボードにコピー</button>
	</div>
	<div>
		<button onclick={solveTranslate}>中国語（簡体）</button>
		{#if solveTranslateHTML}
			<div class="markdown-container">
				{@html solveTranslateHTML}
			</div>
		{/if}
	</div>
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
