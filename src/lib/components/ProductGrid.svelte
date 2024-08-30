<script lang="ts">
	import ProductCard from "$lib/components/ProductCard.svelte";
	import { data } from "$lib/stores/store";
</script>

<div class="box-container">
	{#each $data as product}
		<ProductCard {product} />
	{/each}
</div>

<!--div class="box-container">
	{#if $data && $data.length > 0}
		{#each $data as product}
			<ProductCard {product} />
		{/each}
	{:else if $data && $data.length === 0}
		<h1>No se encuentraron productos.</h1>
	{:else}
		<h1>Cargando....</h1>
	{/if}

	{#if $currentPage <= $totalPages}
		<InfiniteScroll on:loadMore={() => loadMorePages()} />
	{/if}
</div-->
