<script lang="ts">
	import 'virtual:uno.css'
	import '$lib/assets/style/app.scss'

	import { dev } from '$app/environment'
	import { page } from '$app/state'
	import favicon from '$lib/assets/favicon.svg'
	import homeUrlQrcode from '$lib/assets/home-url-qrcode.svg'
	import LoadingEffect from '$lib/components/common/LoadingEffect.svelte'
	import MessageCenter from '$lib/components/common/MessageCenter.svelte'
	import { NAV_MENUS } from '$lib/constants/(view)/common/nav'
	import { onMount } from 'svelte'

	const CLOUDFLARE_TURNSTILE_SITE_KEY = '0x4AAAAAAB10XkovXKRU1Ct5'
	const CLOUDFLARE_TURNSTILE_TEST_SITE_KEY_ALWAYS_PASSES = '1x00000000000000000000AA'

	let { children } = $props()

	let turnstileSuccess = $state('')

	onMount(() => {
		window.onTurnstileSuccess = onTurnstileSuccess
	})

	function onTurnstileSuccess() {
		turnstileSuccess = 'success'
	}
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
			{#each NAV_MENUS as menu}
				<a href={menu.link}>{menu.icon}</a>
			{/each}
			<a href="https://translate.google.com" target="_blank">🚪</a>
		</nav>
	{/if}
</header>

{@render children?.()}

<footer>
	<div
		class="cf-turnstile"
		data-sitekey={dev
			? CLOUDFLARE_TURNSTILE_TEST_SITE_KEY_ALWAYS_PASSES
			: CLOUDFLARE_TURNSTILE_SITE_KEY}
		data-size="flexible"
		data-callback="onTurnstileSuccess"
		data-success={turnstileSuccess}
	></div>

	{#if page.url.pathname === '/'}
		<img width="120" src={homeUrlQrcode} alt="Home URL QR Code" />
	{/if}

	<div>AI 生成はときに誤りを含みます。自己レビューの上お使いください。</div>
</footer>

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

	.cf-turnstile {
		position: fixed;
		right: 0.4rem;
		bottom: 0.8rem;
	}
	.cf-turnstile[data-success='success'] {
		position: absolute;
		z-index: -1;
	}
</style>
