<script lang="ts">
	import favicon from '$lib/assets/favicon.svg'

	let { children } = $props()
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	<h1>Zinnias ❁</h1>
	<nav>
		<a href="/">🏠️</a>
	</nav>
</header>

{@render children?.()}
