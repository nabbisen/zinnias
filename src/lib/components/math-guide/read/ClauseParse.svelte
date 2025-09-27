<script lang="ts">
	import { clauseParse } from '$lib/(view)/math-guide/read/clause'
	import CopyToClipboard from '$lib/components/common/CopyToClipboard.svelte'
	import { messages } from '$lib/stores/message-center.svelte'
	import type { ClauseItem } from '$lib/types/(view)/math-guide/clause-parse'

	const { text }: { text: string } = $props()

	let clauses: ClauseItem[] = $state([])

	const hasTranslation = $derived(clauses.some((x) => x.translate))

	$effect(() => {
		if (!text.trim()) return

		clauseParse(text)
			.then((result) => {
				clauses = result
			})
			.catch((error: unknown) => {
				messages.pushError(error)
				return []
			})
	})
</script>

{#if 0 < clauses.length}
	<table>
		<tbody>
			{#each clauses as clause}
				<tr>
					<td>{clause.txt}</td>
					<td>{clause.kana}</td>
					<td>{clause.desc}</td>
					{#if hasTranslation}
						<td>{clause.translate}</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>

	{#if text}
		<div>
			<CopyToClipboard {text} />
		</div>
	{/if}
{/if}
