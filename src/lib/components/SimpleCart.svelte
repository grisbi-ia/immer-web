<script lang="ts">
	import { cartProducts, totalCart, totalUnities } from '../stores/store';

	$: totalAmount = $totalCart;
	$: quantityProduct = $cartProducts.length;
	$: countUnities = $totalUnities;

	let products = $cartProducts as Product[];
	export let showCartForm = () => {};
</script>

<div class="shopping-cart active">
	<h3 class="close" on:click={showCartForm}>x</h3>
	<!--{#if $cartProducts && $cartProducts.length > 0}
		{#each products as product}
			<div class="box">
				<i class="fas fa-times" />
				<img src="image/cart-1.jpg" alt="" />
				<div class="content">
					<h3>{product.name}</h3>
					<span class="quantity">{product.availibilityCount}</span>
					<span class="multiply">x</span>
					<span class="price">${product.newPrice}</span>
				</div>
			</div>
		{/each}
	{:else}
		<h1>No items</h1>
	{/if}
	-->
	<h3 class="total">Items : <span>{quantityProduct}</span></h3>
	<h3 class="total">Unidades : <span>{countUnities}</span></h3>
	<h3 class="total">Total : <span>${totalAmount.toFixed(2)}</span></h3>
	<a href={'/cart'} class="btn">Ver Carrito</a>
</div>
