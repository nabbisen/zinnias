<script lang="ts">
	import { compressImage, copyToClipboard } from '$lib/utils'
	import { marked } from 'marked'
	import { generateMathGuide } from './utils'
	import dompurify from 'dompurify'
	import katex, { type KatexOptions } from 'katex'

	let msg = $state('')
	let imgSrc = $state('')
	let showImgSrc = $state(false)
	let readGeneratedTexts = $state('')
	let readHTML = $state('')
	let describeGeneratedTexts = $state('')
	let describeHTML = $state('')
	let solveGeneratedTexts = $state('')
	let solveHTML = $state('')

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
			msg = 'イメージがえらばれていません。'
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

		const ret = (await generateMathGuide(file, processor)) as string

		let retHTML = dompurify.sanitize(await marked.parse(ret))
		const katexRegex = /\$\$[^$]+\$\$|\$[^$]+\$/g
		retHTML = retHTML.replace(katexRegex, (matched: string) => {
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
		})

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

	function compressImageErrorCallback(err: Error) {
		console.error('画像の圧縮中にエラーが発生しました:', err.message)
		msg = '画像の圧縮中にエラーが発生しました。'
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

	async function textToClipboard(text: string) {
		if (await copyToClipboard(text)) {
			msg = 'クリップボードにコピーしました'
		} else {
			msg = 'クリップボードへのコピーがしっぱいしました'
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

{#if msg}
	<p>{msg}</p>
{/if}

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
