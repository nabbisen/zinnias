<script lang="ts">
	import { dev } from '$app/environment'
	import { page } from '$app/state'
	import favicon from '$lib/assets/favicon.svg'
	import '$lib/assets/style.scss'
	import LoadingEffect from '$lib/components/LoadingEffect.svelte'
	import MessageCenter from '$lib/components/MessageCenter.svelte'

	const CLOUDFLARE_TURNSTILE_SITE_KEY = '0x4AAAAAAB10XkovXKRU1Ct5'
	const CLOUDFLARE_TURNSTILE_TEST_SITE_KEY_ALWAYS_PASSES = '1x00000000000000000000AA'

	let { children } = $props()
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</svelte:head>

<header>
	<h1>
		Zinnias
		{#if page.url.pathname !== '/'}🌼{/if}
	</h1>
	{#if page.url.pathname !== '/'}
		<nav>
			<a href="/">🏠️</a>
			<a href="text-from-image">🖼️</a>
			<a href="easier-expression">🔤</a>
			<a href="image-description">👀</a>
			<a href="math-guide">⊿</a>
			<a href="https://translate.google.com" target="_blank">🚪</a>
		</nav>
	{/if}

	<div
		class="cf-turnstile"
		data-sitekey={dev
			? CLOUDFLARE_TURNSTILE_TEST_SITE_KEY_ALWAYS_PASSES
			: CLOUDFLARE_TURNSTILE_SITE_KEY}
		data-callback={(e: any) => {
			console.log(123, e)
		}}
	></div>
</header>

{@render children?.()}

<footer>AI 生成はときに誤りを含みます。自己レビューの上お使いください。</footer>

<LoadingEffect />
<MessageCenter />

<style>
	a[href='/'] {
		margin-right: 0.7em;
	}
	a[target='_blank'] {
		margin-left: 0.7em;
	}
	a:not([href='/']):not([target='_blank']) {
		font-size: 115%;
		padding: 0.5em;
	}
</style>
