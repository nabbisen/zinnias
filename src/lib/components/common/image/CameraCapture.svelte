<script lang="ts">
	import { IMAGE_DEFAULT_MIME } from '$lib/constants/common/image'
	import { messages } from '$lib/stores/message-center.svelte'
	import { onDestroy } from 'svelte'

	let { onCapture }: { onCapture: (dataUrl: string) => void } = $props()

	let videoEl: HTMLVideoElement | null = $state(null)
	let canvasEl: HTMLCanvasElement | null = $state(null)
	let isStreaming = $state(false)

	let stream: MediaStream | null = null

	$effect(() => {
		if (isStreaming && videoEl) {
			videoEl.srcObject = stream
			videoEl.play()

			videoEl.scrollIntoView()
		}
	})

	// カメラを起動する
	// notes:
	//   - localhost 以外の場合、https 通信が必要
	//   - ブラウザで getUserMedia を許可する必要がある
	//   - モバイルでは facingMode: 'environment' を指定すると背面カメラを優先
	async function startCamera() {
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
				audio: false,
			})
		} catch (err: unknown) {
			messages.pushError('カメラ起動に失敗しました:', (err as DOMException).message)
			return
		}

		isStreaming = true
	}

	// 静止画を撮影して <canvas> に表示
	function takePhoto() {
		if (!videoEl || !canvasEl) return

		const w = videoEl.videoWidth || videoEl.clientWidth
		const h = videoEl.videoHeight || videoEl.clientHeight
		// キャンバスをビデオのピクセルサイズに合わせる
		canvasEl.width = w
		canvasEl.height = h

		const ctx = canvasEl.getContext('2d')
		if (!ctx) return

		// ビデオの現在フレームを描画
		ctx.drawImage(videoEl, 0, 0, w, h)

		onCapture(canvasEl.toDataURL(IMAGE_DEFAULT_MIME))

		stopCamera()
	}

	// カメラを停止する
	function stopCamera() {
		if (stream) {
			stream.getTracks().forEach((t) => t.stop())
			stream = null
		}

		if (videoEl) {
			try {
				videoEl.pause()
			} catch (err) {
				messages.pushError('カメラの停止時に予期せぬエラー')
			}
			videoEl.srcObject = null
		}

		isStreaming = false
	}

	onDestroy(() => {
		stopCamera()
	})
</script>

<article>
	<header>
		<div role="group">
			<button onclick={startCamera} disabled={isStreaming}>カメラ起動</button>
			<button onclick={takePhoto} disabled={!isStreaming}>撮影</button>
			<button class="outline" onclick={stopCamera} disabled={!isStreaming}>停止</button>
		</div>
	</header>

	<div class={`video-wrap ${isStreaming ? 'streaming' : ''}`}>
		<!-- camera preview -->
		<video bind:this={videoEl} playsinline muted></video>
	</div>

	<!-- captured image -->
	<canvas bind:this={canvasEl}></canvas>
</article>

<style>
	.video-wrap {
		position: relative;
		display: none;
	}

	.video-wrap.streaming {
		display: block;
	}

	video {
		width: 100%;
		height: auto;
		max-height: 60vh;
		object-fit: cover;
		border-radius: 0.4rem;
	}
</style>
