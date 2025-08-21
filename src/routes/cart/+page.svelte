<script lang="ts">
	import {
		showAlert,
		getUserFromToken,
		reloadUserFromToken,
		markNavigationFromShop, // 🆕 Importar función de persistencia
	} from "$lib/util/util";
	import { cartProducts } from "../../lib/stores/store";
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import LoginForm from "$lib/components/LoginForm.svelte";
	import { currentUser } from "$lib/stores/store";
	import { onMount } from "svelte";

	onMount(async () => {
		if (getUserFromToken()) {
			reloadUserFromToken();
		}
	});

	const minusItem = (product: Product) => {
		if (product.availibilityCountInCart > 1) {
			product.availibilityCountInCart -= 1;
			$cartProducts = $cartProducts;
		} else {
			$cartProducts = $cartProducts.filter(
				(cartItem) => cartItem != product,
			);
		}
		return;
	};

	const plusItem = (product: Product) => {
		if (product.availibilityCountInCart + 1 > product.availibilityCount) {
			showAlert(
				"error",
				"Error",
				"La cantidad a comprar es mayor al stock actual",
			);
			return;
		}
		product.availibilityCountInCart += 1;
		$cartProducts = $cartProducts;
		return;
	};

	const removeItem = (product: Product) => {
		$cartProducts = $cartProducts.filter((cartItem) => cartItem != product);
		return;
	};

	// 🆕 NAVEGACIÓN PERSISTENTE - Marcar que vamos a restaurar al volver a shop
	function handleBackToShop() {
		// Marcar en sessionStorage que estamos volviendo al shop desde cart
		if (typeof window !== "undefined") {
			sessionStorage.setItem("navigatedFromShop", "true");
			sessionStorage.setItem("shopNavigationTime", Date.now().toString());
			console.log("🔄 Marked navigation back to shop from cart");
		}
	}

	function isNumeric(value) {
		return !isNaN(parseFloat(value)) && isFinite(value);
	}

	function isValidateQuantity(number = 0) {
		if (isNumeric(number) && number > 0) {
			return true;
		} else {
			return false;
		}
	}

	const changeQuantity = (product: Product) => {
		console.log(product.availibilityCountInCart);
		if (!isValidateQuantity(product.availibilityCountInCart)) {
			product.availibilityCountInCart = 1;
			$cartProducts = $cartProducts;
		} else {
			if (product.availibilityCountInCart > product.availibilityCount) {
				product.availibilityCountInCart = 1;
				$cartProducts = $cartProducts;
				showAlert(
					"error",
					"Error",
					"La cantidad a comprar es mayor al stock actual",
				);
				return;
			}
		}
		return;
	};

	$: total = $cartProducts.reduce(
		(sum, item) => sum + item.newPrice * item.availibilityCountInCart,
		0,
	);

	$: subtotal = total / 1.15;

	$: tax = total - subtotal;

	$: discount = $cartProducts.reduce(
		(sum, item) =>
			sum +
			(item.newPrice * item.availibilityCountInCart -
				item.oldPrice * item.availibilityCountInCart),
		0,
	);

	const handleImgError = (ev) => (ev.target.src = "/image/product.webp");
	const handleImgBrandError = (ev) => (ev.target.src = "/image/no-brand.png");
</script>

<Header />

<div class="heading">
	<h1>Carrito de Compras</h1>
	<p><a href="/home">Inicio >></a> Carrito</p>
</div>

<section class="about">
	<div class="content">
		{#if $currentUser}
			{#if $cartProducts && $cartProducts.length > 0}
				<h3>Items en tu carrito:</h3>
				<p>
					Detallamos los productos agregados al carrito de compras.
					Auquí puedes agragar o disminuir más unidades, así como
					eliminar productos.
				</p>
				<br />
				<div class="cart-list">
					<div class="cart-item">
						<div>
							<h1>Imágen</h1>
						</div>
						<div>
							<h1>Marca</h1>
						</div>
						<div><h1>Nombre</h1></div>
						<div>
							<h1>Precio Final</h1>
							<h1>Unitario</h1>
						</div>
						<div><h1>Cantidad</h1></div>
						<div><h1>Total</h1></div>
					</div>
					{#each $cartProducts as item}
						<div class="cart-item">
							<!--
							<img width="50" src={item.image} alt={item.name} />
							-->
							<div>
								<img
									width="50"
									src={`/image/products/${item.id}.webp`}
									alt=""
									on:error={handleImgError}
								/>
							</div>
							<div>
								<img
									width="50"
									src={`/image/brand/${item.brandName}.png`}
									alt="Marca"
									on:error={handleImgBrandError}
								/>
							</div>
							<p>{item.name}</p>
							<p>${item.newPrice.toFixed(2)}</p>
							<div class="quantity">
								<input
									type="number"
									min="1"
									max="9999"
									bind:value={item.availibilityCountInCart}
									on:change|preventDefault={() =>
										changeQuantity(item)}
									on:input={() => changeQuantity(item)}
								/>
								<div class="icons">
									<div
										id="login-btn"
										class="fas fa-plus"
										on:click|preventDefault={() =>
											plusItem(item)}
									/>
									<div
										id="login-btn"
										class="fas fa-minus"
										on:click|preventDefault={() =>
											minusItem(item)}
									/>
									<div
										id="login-btn"
										class="fas fa-times"
										on:click|preventDefault={() =>
											removeItem(item)}
									/>
								</div>
							</div>
							<p>
								${(
									item.newPrice * item.availibilityCountInCart
								).toFixed(2)}
							</p>
						</div>
					{/each}
				</div>
				<br />
				<div class="total">
					<h2>Subtotal: $ {subtotal.toFixed(2)}</h2>
					<h2>Impuestos : $ {tax.toFixed(2)}</h2>
					<h2>TOTAL: $ {total.toFixed(2)}</h2>
					<p>(Valores incluyen impuestos)</p>
					<a href={"/shop"} class="btn" on:click={handleBackToShop}
						>Seguir comprando</a
					>
					<a href={"/checkout"} class="btn">Finalizar Compra</a>
				</div>
			{:else}
				<h3>Tu carrito de compras está vacío.</h3>
				<br />
				<a href={"/shop"} class="btn" on:click={handleBackToShop}
					>Ir a la tienda</a
				>
			{/if}
		{:else}
			<LoginForm />
		{/if}
	</div>
</section>

<Footer />

<style>
	.cart-item {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		align-items: center;
		text-align: center;
		border: 1px solid;
		border-color: lightgray;
	}

	.total {
		text-align: right;
	}

	.cart-list {
		padding: 0px;
	}
	.quantity {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-top: 1rem;
		padding-bottom: 0.5rem;
	}
	.quantity input {
		border: 0.1rem solid rgba(0, 0, 0, 0.3);
		font-size: 1.3rem;
		font-weight: bolder;
		color: var(--black);
		padding: 0.8rem;
		background: rgba(0, 0, 0, 0.05);
		width: 7rem;
	}
	.quantity .icons div {
		font-size: 2.5rem;
		margin-left: 1.7rem;
		cursor: pointer;
		color: #666;
	}
</style>
