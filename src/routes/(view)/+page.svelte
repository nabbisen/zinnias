<script>
	import { NAV_MENUS } from '$lib/constants/(view)/common/nav'
</script>

<div>
	<ul>
		{#each NAV_MENUS as menu}
			<li><a href={menu.link}>{menu.label}</a></li>
		{/each}
	</ul>
</div>

<style>
	div {
		width: auto;
		height: 70vh;
		background-image: url('/bg.jpg');
		background-repeat: no-repeat;
		background-size: contain;
	}

	ul {
		background-color: #ffffffbb;
		padding: 1.2rem 2.4rem;
	}
	ul li:not(:first-child):not(:last-child) {
		margin: 0.7em 0;
	}
</style>
