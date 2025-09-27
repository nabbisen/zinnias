<script lang="ts">
	import { loading } from '$lib/stores/loading-effect.svelte'
</script>

{#if loading.active}
	<div class="overlay">
		<div class="spinner"></div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #00000044;
		z-index: 30000;
		pointer-events: none;
	}

	.spinner {
		border: 4px solid rgba(0, 0, 0, 0.15);
		border-top: 4px solid #4169e1;
		border-radius: 50%;
		width: 50px;
		height: 50px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
