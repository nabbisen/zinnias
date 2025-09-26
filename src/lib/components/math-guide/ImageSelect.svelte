<script lang="ts">
	import { postFormData } from '$lib/(view)/common/api'

	const { fileOnchange }: { fileOnchange: (file: File) => void } = $props()

	let file: File | null = $state(null)

	function handleFileChange(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement
		}
	) {
		if (!e.currentTarget.files) {
			return
		}
		const f = e.currentTarget.files[0]
		file = f
		fileOnchange(f)
	}

	async function imageValidateAnalyze(file: File): Promise<string> {
		const formData = new FormData()
		formData.append('image', file, file.name)

		const responseJson = await postFormData('/api/math-guide/image-validate-analyze', formData)
		return responseJson.analyzed
	}
</script>

<div>
	<input type="file" onchange={handleFileChange} />
</div>

<button
	onclick={async () => {
		const ret = await imageValidateAnalyze(file!)
	}}>かいせき (todo)</button
>
