<script>
	import { cartProducts } from '../lib/stores/store';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LoginForm from '$lib/components/LoginForm.svelte';
	import { currentUser } from '$lib/stores/store';

	const minusItem = (product) => {
		for (let item of $cartProducts) {
			if (item.id === product.id) {
				if (product.availibilityCount > 1) {
					product.availibilityCount -= 1;
					$cartProducts = $cartProducts;
				} else {
					$cartProducts = $cartProducts.filter((cartItem) => cartItem != product);
				}
				return;
			}
		}
	};

	const plusItem = (product) => {
		for (let item of $cartProducts) {
			if (item.id === product.id) {
				product.availibilityCount += 1;
				$cartProducts = $cartProducts;
				return;
			}
		}
	};

	const removeItem = (product) => {
		for (let item of $cartProducts) {
			if (item.id === product.id) {
				$cartProducts = $cartProducts.filter((cartItem) => cartItem != product);
				return;
			}
		}
	};

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

	const changeQuantity = (product) => {
		for (let item of $cartProducts) {
			if (item.id === product.id) {
				if (!isValidateQuantity(product.availibilityCount))
					$cartProducts = $cartProducts.filter((cartItem) => cartItem != product);
				return;
			}
		}
	};

	$: total = $cartProducts.reduce((sum, item) => sum + item.newPrice * item.availibilityCount, 0);

	let fallback = 'image/products/no-image.png';
	const handleImgError = (ev) => (ev.target.src = fallback);
</script>

<Header />

<div class="heading">
	<h1>Carrito de Compras</h1>
	<p><a href="/">Inicio >></a> Carrito</p>
</div>

<section class="about">
	<div class="content">
		{#if $currentUser}
			{#if $cartProducts && $cartProducts.length > 0}
				<h3>Items en tu carrito:</h3>
				<p>
					Detallamos los productos agregados al carrito de compras. Auquí puedes agragar o disminuir
					más unidades, así como eliminar productos.
				</p>

				<div class="total">
					<h2>Total: $ {total.toFixed(2)}</h2>
					<p>(Valores incluyen impuestos)</p>
				</div>
				<br />
				<div class="cart-list">
					<div class="cart-item">
						<div>
							<h1>Imágen</h1>
						</div>
						<div><h1>Nombre</h1></div>
						<div>
							<h1>Precio</h1>
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
									src={`image/products/${item.id}.png`}
									alt=""
									on:error={handleImgError}
								/>
							</div>
							<p>{item.name}</p>
							<p>${item.newPrice.toFixed(2)}</p>
							<div class="quantity">
								<input
									class="set-width"
									type="number"
									min="1"
									max="9999"
									bind:value={item.availibilityCount}
									on:change|preventDefault={() => changeQuantity(item)}
								/>
								<div class="icons">
									<div
										id="login-btn"
										class="fas fa-plus"
										on:click|preventDefault={() => plusItem(item)}
									/>
									<div
										id="login-btn"
										class="fas fa-minus"
										on:click|preventDefault={() => minusItem(item)}
									/>
									<div
										id="login-btn"
										class="fas fa-times"
										on:click|preventDefault={() => removeItem(item)}
									/>
								</div>
							</div>
							<p>${(item.newPrice * item.availibilityCount).toFixed(2)}</p>
						</div>
					{/each}
				</div>
				<br />
				<div class="total">
					<h2>Total: $ {total.toFixed(2)}</h2>
					<p>(Valores incluyen impuestos)</p>
					<a href={'/shop'} class="btn">Seguir comprando</a>
					<a href={'/checkout'} class="btn">Finalizar Compra</a>
				</div>
			{:else}
				<h3>Tu carrito de compras está vacío.</h3>
				<br />
				<a href={'/shop'} class="btn">Ir a la tienda</a>
			{/if}
		{:else}
			<LoginForm />
		{/if}
	</div>
</section>

<Footer />

<style>
	.set-width {
		width: 65px;
	}
	.cart-item {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
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
	}
	.quantity .icons div {
		font-size: 2.5rem;
		margin-left: 1.7rem;
		cursor: pointer;
		color: #666;
	}
</style>
