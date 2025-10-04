<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import Cropper from 'cropperjs'
	import 'cropperjs/dist/cropper.css'
	import { messages } from '$lib/stores/message-center.svelte'

	const {
		dataUrl,
		onCrop,
		reset,
	}: {
		dataUrl: string
		onCrop: (dataUrl: string) => void
		reset: () => void
	} = $props()

	let imageElement: HTMLImageElement | null = $state(null)
	let cropper: Cropper | null = $state(null)

	$effect(() => {
		if (imageElement) {
			cropper = new Cropper(imageElement, {
				viewMode: 1,
			})
		}
	})

	onDestroy(() => {
		if (cropper) {
			cropper.destroy()
		}
	})

	function handleCrop() {
		if (!cropper) {
			messages.pushError('きりぬきはんいを取得できません')
			return
		}
		onCrop(cropper.getCroppedCanvas().toDataURL())
	}
</script>

<div role="group">
	<button onclick={handleCrop}>きりぬき</button>
	<button class="outline" onclick={reset}>やりなおし</button>
</div>
<img bind:this={imageElement} src={dataUrl} alt="Croppable" />

<style>
	/* cropper.js に必要 ? */
	img {
		display: block;
		max-width: 100%;
	}
</style>
