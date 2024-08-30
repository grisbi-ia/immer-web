<script lang="ts">
	import { closeModal } from "svelte-modals";
	import {
		token,
		currentUser,
		addProduct,
		getIndexProductInCart,
	} from "../stores/store";
	import { showAlert, isValidToken } from "$lib/util/util";
	import { data } from "$lib/stores/store";

	export let product: Product;

	export let isOpen;

	let isAuth = false;
	$: if ($token || !$token) {
		isAuth = isValidToken();
	}

	function closeAppModal() {
		closeModal();
	}
	function keydown(e: KeyboardEvent) {
		e.stopPropagation();
		if (e.key === "Escape") {
			closeAppModal();
		}
	}

	let quantity: number = 1;

	function addPoductCart() {
		if (
			quantity + product?.availibilityCountInCart >
			product.availibilityCount
		) {
			showAlert(
				"error",
				"Error",
				"La cantidad a comprar es mayor al stock actual"
			);
		} else {
			product.availibilityCountInCart = addProduct(product, quantity);
			$data[getIndexProductInCart(product)].availibilityCountInCart =
				product.availibilityCountInCart;
			showAlert("success", "Producto Agregado", product.name);
			quantity = 1;
		}
	}

	function getPrice() {
		if ($currentUser.person.discountRate) {
			const a =
				product.newPrice * ($currentUser.person.discountRate / 100);
			const b = product.newPrice - a;
			return Math.round(b * 100) / 100;
		} else return product.newPrice;
	}

	const handleImgError = (ev) => (ev.target.src = "image/product.png");
</script>

{#if isOpen}
	<div role="dialog" class="modal" on:keydown={keydown} tabindex={0}>
		<div class="contents">
			<h3 class="close" on:click={closeAppModal}>x</h3>
			<main>
				<img
					src={`image/products/${product.id}.png`}
					alt=""
					on:error={handleImgError}
				/>

				<h2>{product.name}</h2>

				<table class="table-modal">
					<tbody>
						<tr>
							<th>SKU:</th>
							<td>{product.code}</td>
						</tr>
						<tr
							><th>Marca:</th>
							<td>{product.brandName}</td>
						</tr>
						<tr>
							<th>País:</th>
							<td>{product.countryName}</td>
						</tr>
						{#if product.availibilityCountInCart}
							<tr>
								<th>Items En carrito:</th>
								<td
									><div class="icon-cart">
										<span
											>{product.availibilityCountInCart}</span
										>
										<div
											id="cart-btn"
											title="Unidades en el carrito"
											class="fas fa-shopping-basket"
										/>
									</div></td
								>
							</tr>
						{/if}
					</tbody>
				</table>
				{#if product.description != undefined}
					<p>{product.description}</p>
				{/if}

				{#if isAuth}
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
						<span>(máx.: {product.availibilityCount})</span>
					</div>

					<button class="btn" on:click={addPoductCart}>
						Comprar
					</button>
				{:else}
					<div class="text">
						Iniciar sesión para ver precio y ordenar
					</div>
				{/if}

				<button class="btn" on:click={closeModal}> Cerrar </button>
			</main>
		</div>
	</div>
{/if}

<style>
	main {
		column-count: 2;
		column-width: 350px;
	}

	.table-modal {
		text-align: left;
		font-size: 14px;
	}
	.modal {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		display: flex;
		justify-content: center;
		align-items: center;

		/* allow click-through to backdrop */
		pointer-events: none;
	}

	.modal .close {
		color: #666;
		text-align: right;
		font-size: 2.2rem;
		cursor: pointer;
	}

	.contents {
		min-width: 60vw;
		max-width: 100%;
		max-height: 100%;
		border-radius: 6px;
		padding: 16px;
		background: white;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		pointer-events: auto;
	}

	.contents img {
		margin-top: 30px;
		height: 40rem;
		margin: auto;

		display: block;
		margin: 0px auto;
	}

	h2 {
		text-align: left;
		font-size: 24px;
		max-width: 500px;
	}

	p {
		text-align: left;
		margin-top: 16px;
		font-size: 16px;
		max-width: 500px;
	}

	.price {
		font-size: 3rem;
		color: #333;
		padding: 0.5rem 0;
	}
	.price span {
		font-size: 1.4rem;
		color: #999;
		text-decoration: line-through;
	}

	.text {
		font-size: 1.2rem;
		color: #999;
		padding: 0.5rem 0;
	}

	span {
		padding: 0 0.7rem;
		font-size: 1.5rem;
	}

	.quantity {
		display: flex;
		align-items: left;
		justify-content: left;
		padding-top: 1rem;
		padding-bottom: 0.5rem;
	}

	.quantity span {
		padding: 0 0.7rem;
		font-size: 1.5rem;
	}

	.quantity input {
		border: 0.1rem solid rgba(0, 0, 0, 0.3);
		font-size: 1.3rem;
		font-weight: bolder;
		color: var(--black);
		padding: 0.3rem;
		background: rgba(0, 0, 0, 0.05);
		width: 5rem;
	}

	td {
		padding: 0 15px;
	}
</style>
