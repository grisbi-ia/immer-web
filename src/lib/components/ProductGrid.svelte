<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import InfiniteScroll from '$lib/util/InfiniteScroll.svelte';
	import { totalPages, textToSearch, currentPage, data } from '$lib/stores/store';
	import { get } from 'svelte/store';

	let products = $data as Product[];

	async function moreData() {
		let res: Response;
		res = await fetch('../api/postItems', {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({
				page: get(currentPage),
				textToSearch: get(textToSearch)
			})
		});

		const datas = await res.json();
		const res_results = datas.objectList;
		$data = [...$data, ...res_results];
	}

	function loadMorePages() {
		$currentPage++;
		moreData();
	}
</script>

<div class="box-container">
	{#if $data && $data.length > 0}
		{#each products as product}
			<ProductCard {product} />
		{/each}
	{:else}
		<h1>No items</h1>
	{/if}

	{#if $currentPage < $totalPages}
		<InfiniteScroll on:loadMore={() => loadMorePages()} />
	{/if}
</div>
