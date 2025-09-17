<script lang="ts">
	import { page } from '$app/state'
	import favicon from '$lib/assets/favicon.svg'

	let { children } = $props()
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	<h1>Zinnias ❁</h1>
	{#if page.url.pathname !== '/'}
		<nav>
			<a href="/">🏠️</a>
			<a href="/text-from-image">🖼️</a>
			<a href="/easier-expression">🔤</a>
			<a href="image-description">👀</a>
		</nav>
	{/if}
</header>

{@render children?.()}
