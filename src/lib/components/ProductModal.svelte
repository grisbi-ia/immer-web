<script lang="ts">
	import { closeModal } from 'svelte-modals';
	import { token, currentProduct, cartProducts, addProduct } from '../stores/store';
	import { isValidToken } from '../../routes/api/jwt';
	import { zoom } from '../zomm';
	import { toasts } from 'svelte-toasts';

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
		if (e.key === 'Escape') {
			closeAppModal();
		}
	}

	let quantity: number = 1;
	function addPoductCart() {
		product.availibilityCount = quantity;
		addProduct(product, quantity);
		showToast(product.name);
		quantity = 1;
	}

	const handleImgError = (ev) => (ev.target.src = 'image/product.jpg');
</script>

{#if isOpen}
	<div role="dialog" class="modal" on:keydown={keydown} tabindex={0} autofocus>
		<div class="contents">
			<h3 class="close" on:click={closeAppModal}>x</h3>
			<main>
				<img src={`image/products/${product.id}.png`} alt="" on:error={handleImgError} />

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
					</tbody>
				</table>
				{#if product.description != undefined}
					<p>{product.description}</p>
				{:else}
					<p>{product.name}</p>
				{/if}

				{#if isAuth}
					<div class="price">${product.newPrice} <!--<span> ${product.newPrice} </span>--></div>
					<div class="quantity">
						<span>cantidad : </span>
						<input class="set-width" type="number" min="1" max="9999" bind:value={quantity} />
						<span> Uni. </span>
					</div>
					<button class="btn" on:click={addPoductCart}> Comprar </button>
				{:else}
					<div class="text">Iniciar sesión para ver precio y ordenar</div>
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
	}

	.set-width {
		width: 65px;
	}

	td {
		padding: 0 15px;
	}
</style>
