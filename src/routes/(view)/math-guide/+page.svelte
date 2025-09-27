<script lang="ts">
	import Usage from '$lib/components/math-guide/Usage.svelte'
	import ImageSelect from '$lib/components/math-guide/ImageSelect.svelte'
	import type { MathImageContent } from '$lib/types/(view)/math-guide/image'
	import type { ImageTextData } from '$lib/types/(view)/common/image'
	import Question from '$lib/components/math-guide/Question.svelte'

	let showsUsage = $state(false)

	let imageContent: MathImageContent | null = $state(null)
	let imageTextData: ImageTextData | null = $state(null)

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

{#if imageContent && imageTextData}
	<Question {imageContent} {imageTextData} />
{/if}
