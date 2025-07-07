<script lang="ts">
	import { showAlert } from "$lib/util/util";
	import {
		currentUser,
		token,
		addProduct,
		getProductInCart,
	} from "$lib/stores/store";
	import { isValidToken } from "$lib/util/util";
	import { openModal } from "svelte-modals";
	import ProductModal from "./ProductModal.svelte";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

	export let product: Product;

	onMount(() => {
		product.availibilityCountInCart = 0;
		const productInCart = getProductInCart(product);
		if (productInCart) {
			product.availibilityCountInCart =
				productInCart.availibilityCountInCart;
		}
	});

	let quantity: number = 1;
	let isAuth = false;
	$: if ($token || !$token) {
		isAuth = isValidToken();
	}

	function goToCart() {
		goto("/cart");
	}

	function handleOpen() {
		openModal(ProductModal, {
			product: product,
		});
	}

	function addPoductCart() {
		if (
			quantity + product.availibilityCountInCart >
			product.availibilityCount
		) {
			showAlert(
				"error",
				"Error",
				"La cantidad a comprar es mayor al stock actual",
			);
			quantity = 1;
		} else {
			product.availibilityCountInCart = addProduct(product, quantity);
			showAlert("success", "Producto Agregado", product.name);
			quantity = 1;
		}
	}

	function getPrice() {
		/*
		if ($currentUser && $currentUser.person.discountRate) {
			const a =
				product.newPrice * ($currentUser.person.discountRate / 100);
			const b = product.newPrice - a;
			return Math.round(b * 100) / 100;
		} else return product.newPrice;
*/
		return product.newPrice;
	}

	// Asegúrese de que las rutas estén correctas y sean absolutas
	const handleImgError = (ev) => {
		console.log("Error cargando imagen de producto:", product.id);
		ev.target.src = "/image/product.png";
	};

	const handleImgBrandError = (ev) => {
		console.log("Error cargando imagen de marca:", product.brandName);
		ev.target.src = "/image/no-brand.png";
	};
</script>

<div class="box">
	<!--
	{#if $currentUser && $currentUser?.person?.discountRate > 0}
		<span class="discount" style="background-color: lightblue;"
			>-{$currentUser?.person?.discountRate}%</span
		>
	{/if}
	-->
	{#if $currentUser}
		{#if product.availibilityCountInCart}
			<div class="icon-cart">
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					id="cart-btn"
					title="Unidades en el carrito"
					class="fas fa-shopping-basket"
					on:click={goToCart}
				/>
				<span>{product.availibilityCountInCart}</span>
			</div>
		{/if}
	{/if}
	<div class="product-image-container">
		<img
			on:click={handleOpen}
			src={`/image/products/${product.id}.png`}
			alt="Producto"
			class="product-image"
			loading="lazy"
			decoding="async"
			fetchpriority="low"
			width="200"
			height="200"
			on:error={handleImgError}
			crossorigin="anonymous"
			importance="high"
			referrerpolicy="no-referrer-when-downgrade"
		/>
	</div>
	<div class="brand-container">
		<img
			style="width: auto; height: 3rem;"
			src={`/image/brand/${product.brandName}.png`}
			alt="Marca"
			loading="lazy"
			decoding="async"
			fetchpriority="low"
			importance="auto"
			referrerpolicy="no-referrer-when-downgrade"
			height="48"
			on:error={handleImgBrandError}
		/>
	</div>
	<div class="product-info-container">
		<div class="product-name" on:click={handleOpen} title={product.name}>
			{product.name}
		</div>
		<div class="code">SKU: {product.code}</div>
	</div>
	{#if $currentUser}
		<div class="product-details">
			<div class="price">
				${getPrice()}
				{#if $currentUser?.person?.discountRate > 0}
					<span> ${product.oldPrice.toFixed(2)} </span>
				{/if}
			</div>
			<div class="quantity">
				<span>Cantidad : </span>
				<input
					type="number"
					min="1"
					max={product.availibilityCount}
					bind:value={quantity}
				/>
			</div>
			<div class="stock-info">(máx.: {product.availibilityCount})</div>
			<div class="button-container">
				<button class="btn" on:click={addPoductCart}> Comprar </button>
			</div>
		</div>
	{:else}
		<div class="login-message">
			Iniciar sesión para ver precio y comprar
		</div>
	{/if}
</div>

<style>
	.box {
		display: flex;
		flex-direction: column;
		height: 100%; /* Asegurar altura uniforme */
		min-height: 500px; /* Altura mínima aumentada para acomodar nombres largos */
		position: relative;
	}

	.icon-cart {
		position: absolute;
		top: 1rem;
		right: 0.5rem;
		color: green;
		padding: 0.7rem 1rem;
		font-size: 2rem;
		cursor: pointer;
	}

	.icon-cart span {
		font-size: 1rem;
	}

	.product-image-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200px;
		margin-bottom: 10px;
		position: relative;
		overflow: hidden;
	}

	.product-image {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		transform: translateZ(0); /* Aceleración por hardware */
		backface-visibility: hidden; /* Mejora rendimiento */
		transition: transform 0.3s ease;
	}

	/* Efecto sutil al pasar el cursor */
	.box:hover .product-image {
		transform: scale(
			1.05
		); /* Ligero aumento de tamaño al hover en la tarjeta */
	}

	.brand-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding-bottom: 1.5rem;
		padding-top: 0.5rem;
		height: 48px;
	}

	.product-info-container {
		display: flex;
		flex-direction: column;
		margin-bottom: 10px;
		min-height: 80px; /* Altura mínima en lugar de fija */
		flex-shrink: 0; /* No se contrae */
	}

	.product-name {
		font-size: 1.5rem;
		font-weight: bold;
		color: #222;
		cursor: pointer;
		line-height: 1.3;
		margin-bottom: 5px;
		position: relative;
		text-align: center;
		word-wrap: break-word;
		transition:
			color 0.3s ease,
			transform 0.2s ease;
	}

	.product-name:hover {
		color: #153889;
		transform: scale(1.02);
	}

	.box:hover .product-name {
		color: #153889;
	}

	.code {
		font-size: 1.2rem;
		color: #222;
		text-align: center;
	}

	.product-details {
		flex: 1; /* Expande para ocupar espacio disponible */
		display: flex;
		flex-direction: column;
		margin-top: auto; /* Empuja hacia abajo */
	}

	.price {
		margin: 10px 0;
		font-size: 2rem;
		color: #333;
		text-align: center;
	}

	.price span {
		font-size: 1.4rem;
		color: #999;
		text-decoration: line-through;
	}

	.quantity {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 5px 0;
	}

	.stock-info {
		text-align: center;
		margin: 5px 0;
		font-size: 1.2rem;
	}

	.button-container {
		margin-top: auto; /* Empuja el botón hacia abajo */
		text-align: center;
		padding: 10px 0;
	}

	.login-message {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		color: #999;
		text-align: center;
		padding: 20px 0;
	}
</style>
