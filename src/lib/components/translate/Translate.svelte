<script lang="ts">
	import { translate } from '$lib/(view)/common/translate'
	import { TRANSLATE_LANGUAGES } from '$lib/constants/(view)/common/translate'

	const {
		text,
		processTranslatedText,
		renderAsHTML,
	}: {
		text: string
		processTranslatedText?: (translatedText: string) => string | Promise<string>
		renderAsHTML: boolean
	} = $props()

	let translated: string | null = $state(null)

	const cachedTranslation: { code: string; text: string }[] = []

	async function handleTranslate(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement
		}
	) {
		const targetLanguage = e.currentTarget.dataset.targetLanguage!

		const cached = cachedTranslation.find((x) => x.code === targetLanguage)
		if (cached) {
			translated = cached.text
			return
		}

		translated = await translate(text, targetLanguage)
		if (processTranslatedText) {
			translated = await processTranslatedText(translated)
		}

		cachedTranslation.push({ code: targetLanguage, text: translated })
	}
</script>

<div>
	{#each TRANSLATE_LANGUAGES as language}
		<button data-target-language={language.code} onclick={handleTranslate}>{language.label}</button>
	{/each}
</div>

{#if translated}
	<div>
		{#if renderAsHTML}
			{@html translated}
		{:else}
			{translated}
		{/if}
	</div>
{/if}
