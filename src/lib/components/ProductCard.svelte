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
	import { zoom } from "../zomm";
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
		if ($currentUser && $currentUser.person.discountRate) {
			const a =
				product.newPrice * ($currentUser.person.discountRate / 100);
			const b = product.newPrice - a;
			return Math.round(b * 100) / 100;
		} else return product.newPrice;
	}
	const handleImgError = (ev) => (ev.target.src = "image/product.png");
</script>

<div class="box">
	{#if $currentUser && $currentUser?.person?.discountRate > 0}
		<span class="discount" style="background-color: lightblue;"
			>-{$currentUser?.person?.discountRate}%</span
		>
	{/if}
	{#if $currentUser}
		{#if product.availibilityCountInCart}
			<div class="icon-cart">
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
	<img
		use:zoom
		on:click={handleOpen}
		src={`https://immer.ec/image/products/${product.id}.png`}
		alt=""
		decoding="auto"
		on:error={handleImgError}
	/>
	<div style="padding-bottom: 2rem; padding-top: 2px;">
		<img
			style="width: auto; height: 3rem;"
			src={`image/brand/ipone.png`}
			alt="Marca"
		/>
	</div>
	<h3 on:click={handleOpen}>{product.name}</h3>
	<div class="code">SKU: {product.code}</div>
	{#if $currentUser}
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
		<br />
		<br />
		<div>(máx.: {product.availibilityCount})</div>
		<button class="btn" on:click={addPoductCart}> Comprar </button>
	{:else}
		<div class="text">Iniciar sesión para ver precio y comprar</div>
	{/if}
</div>

<style>
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
</style>
