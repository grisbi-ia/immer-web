<script lang="ts">
	import { totalPages, currentPage, data, textToSearch, groupToSearch } from '$lib/stores/store';
	import { get } from 'svelte/store';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	async function searchItems() {
		let res: Response;
		res = await fetch('../api/postItems', {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({
				page: get(currentPage),
				textToSearch: get(textToSearch),
				groupToSearch: get(groupToSearch)
			})
		});

		const datas = await res.json();
		const res_results = datas.objectList;
		$data = [...res_results];
		totalPages.set(await datas.lastPage);
	}

	function search() {
		if ($page.url.pathname != '/shop') goto('/shop');
		currentPage.set(1);
		totalPages.set(0);
		groupToSearch.set(null);
		data.set(undefined);
		searchItems();
	}

	export let showSearchForm = () => {};
</script>

<form on:submit|preventDefault={search} class="search-form active">
	<input
		type="search"
		placeholder="Buscar Repuesto..."
		id="search-box"
		bind:value={$textToSearch}
	/>
	<label for="search-box" class="fas fa-search" on:click|preventDefault={search} />
	<label for="search-box" class="fas fa-times" on:click|preventDefault={showSearchForm} />
</form>
