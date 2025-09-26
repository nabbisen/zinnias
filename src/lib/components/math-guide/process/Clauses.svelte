<script lang="ts">
	import { clauseParse } from '$lib/(view)/math-guide/image-process'
	import { messages } from '$lib/stores/message-center.svelte'
	import type { ClauseItem } from '$lib/types/(view)/math-guide/clause-parse'
	import { copyToClipboard } from '$lib/utils/(view)'

	const { file }: { file: File } = $props()

	let clauses: ClauseItem[] = $state([])

	let wholeText = $derived(clauses.map((x) => x.txt).join(' '))
	let hasTranslation = $derived(clauses.some((x) => x.translate))

	async function handle() {
		try {
			clauses = ((await clauseParse(file)) as unknown as { clauses: ClauseItem[] }).clauses
		} catch (error) {
			messages.pushError(error as string)
			return
		}
	}

	async function handleTextToClipboard(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement
		}
	) {
		if (!wholeText) {
			messages.pushError('はりつけるテキストがありません')
			return
		}

		if (await copyToClipboard(wholeText)) {
			messages.pushInfo('クリップボードにコピーしました')
		} else {
			messages.pushError('クリップボードへのコピーがしっぱいしました')
		}
	}
</script>

<button onclick={handle}>もんだいぶん の にほんご</button>
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

	<div>
		<button data-processor="read" onclick={handleTextToClipboard}>クリップボードにコピー</button>
	</div>
{/if}
