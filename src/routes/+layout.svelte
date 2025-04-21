<script>
	import '../app.css';
	import { assets } from '$app/paths';
	import { toasts, ToastContainer, FlatToast } from 'svelte-toasts';
	import { browser } from '$app/environment';
	let index = 0;
	
	// Registrar el Service Worker
	if (browser && 'serviceWorker' in navigator) {
		window.addEventListener('load', () => {
			navigator.serviceWorker.register('/sw.js')
				.then(registration => {
					console.log('Service Worker registrado con éxito:', registration.scope);
				})
				.catch(error => {
					console.error('Error al registrar el Service Worker:', error);
				});
		});
	}
</script>

<svelte:head>
	<title>IMMER</title>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width,initial-scale=1" />
	<meta name="description" content="IMMER - Repuestos y accesorios para motos" />
	<meta name="keywords" content="IMMER, repuestos, motos, accesorios" />
	<meta name="author" content="GRISBI" />
	<meta http-equiv="Cache-Control" content="max-age=86400" />
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
		crossorigin="anonymous"
	/>
	<link rel="preconnect" href="https://immer.ec" />
</svelte:head>

<slot />

<ToastContainer let:data>
	<FlatToast {data} />
</ToastContainer>
