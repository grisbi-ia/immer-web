<script lang="ts">
	import { currentUser, token, currentProduct, cartProducts, addProduct } from '$lib/stores/store';
	import { isValidToken } from '../../routes/api/jwt';
	import { openModal } from 'svelte-modals';
	import { zoom } from '../zomm';
	import ProductModal from './ProductModal.svelte';
	import { goto } from '$app/navigation';

	import { toasts, ToastContainer, FlatToast } from 'svelte-toasts';

	const showToast = (productName) => {
		const toast = toasts.add({
			title: 'Producto Agregado',
			description: productName,
			duration: 1000,
			placement: 'top-center',
			type: 'info',
			theme: 'dark',
			showProgress: true,
			onClick: () => {},
			onRemove: () => {}
		});
	};

	export let product: Product;

	let quantity: number = 1;
	let isAuth = false;
	$: if ($token || !$token) {
		isAuth = isValidToken();
	}

	function goToCart() {
		goto('/cart');
	}

	let productInCart: Product = $cartProducts.find((obj) => {
		return obj.id === product.id;
	});

	function handleOpen() {
		currentProduct.set(product.id);
		openModal(ProductModal, {
			product: product
		});
	}

	function addPoductCart() {
		product.availibilityCount = quantity;
		addProduct(product, quantity);
		showToast(product.name);
		quantity = 1;
		productInCart = $cartProducts.find((obj) => {
			return obj.id === product.id;
		});
	}

	function getNewPrice(price: number) {
		if ($currentUser) {
			const a = price * ($currentUser.person.discountRate / 100);
			const b = price - a;
			return Math.round(b * 100) / 100;
		} else return price;
	}

	const handleImgError = (ev) => (ev.target.src = 'image/product.jpg');
</script>

<div class="box">
	{#if $currentUser?.person?.discountRate > 0}
		<!--
		<span class="discount">-{$currentUser?.person?.discountRate}%</span>
		-->
	{/if}
	{#if $currentUser}
		{#if productInCart}
			<div class="icon-cart">
				<div
					id="cart-btn"
					title="Unidades en el carrito"
					class="fas fa-shopping-basket"
					on:click={goToCart}
				/>
				<span>{productInCart.availibilityCount}</span>
			</div>
		{/if}
	{/if}
	<img
		use:zoom
		on:click={handleOpen}
		src={`image/products/${product.id}.png`}
		alt=""
		on:error={handleImgError}
	/>
	<h3 on:click={handleOpen}>{product.name}</h3>
	<div class="code">SKU: {product.code}</div>
	{#if $currentUser}
		<div class="price">
			${product.newPrice}<!--<span> ${product.oldPrice} </span>-->
		</div>
		<div class="quantity">
			<span>cantidad : </span>
			<input class="set-width" type="number" min="1" max="9999" bind:value={quantity} />
			<span> Uni. </span>
		</div>
		<button class="btn" on:click={addPoductCart}> Comprar </button>
	{:else}
		<div class="text">Iniciar sesión para ver precio y comprar</div>
	{/if}
</div>

<ToastContainer let:data>
	<FlatToast {data} />
</ToastContainer>

<style>
	.set-width {
		width: 65px;
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
</style>
