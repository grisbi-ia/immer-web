<script lang="ts">
	import ProductCard from "$lib/components/ProductCard.svelte";
	import { data } from "$lib/stores/store";
	import { onMount } from "svelte";
	
	let observer;
	
	// Usamos Intersection Observer solo para cargar imágenes de manera eficiente
	// pero sin afectar la visibilidad
	onMount(() => {
		if (typeof IntersectionObserver !== 'undefined') {
			observer = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						// Cuando la tarjeta de producto es visible, cargamos su contenido
						const productCard = entry.target;
						
						// Todas las imágenes dentro de esta tarjeta, cambiamos lazy por eager
						const images = productCard.querySelectorAll('img[loading="lazy"]');
						images.forEach(img => {
							img.setAttribute('loading', 'eager');
						});
						
						// Una vez optimizado, dejamos de observar
						observer.unobserve(productCard);
					}
				});
			}, {
				// Comenzar a cargar cuando el elemento está cerca (300px) de ser visible
				rootMargin: '300px',
				threshold: 0.01
			});
			
			// Observar todos los contenedores de productos
			document.querySelectorAll('.product-wrapper').forEach(product => {
				observer.observe(product);
			});
		}
		
		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
	});
</script>

<div class="box-container">
	{#each $data as product}
		<div class="product-wrapper">
			<ProductCard {product} />
		</div>
	{/each}
</div>

<style>
	.box-container {
		display: grid;
		grid-gap: 1.5rem;
		grid-template-columns: repeat(auto-fill, minmax(25rem, 1fr));
		background: #ffffff;
	}
	
	.product-wrapper {
		opacity: 1;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
		display: flex;
		height: 100%; /* Asegura que el wrapper ocupe toda la altura disponible */
		border-radius: 5px; /* Esquinas redondeadas */
	}
	
	.product-wrapper > :global(.box) {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		transition: all 0.3s ease;
		border-radius: 5px; /* Esquinas redondeadas */
		overflow: hidden; /* Contiene los bordes redondeados */
	}
	
	/* Solo aplicar efecto de hover en dispositivos que no sean móviles */
	@media (min-width: 768px) {
		.product-wrapper:hover {
			transform: translateY(-8px); /* Mayor elevación */
			box-shadow: 0 8px 25px rgba(0,0,0,0.12); /* Sombra más suave y amplia */
		}
		
		.product-wrapper:hover > :global(.box) {
			border-color: #4238ca; /* Borde destacado */
		}
	}
</style>
