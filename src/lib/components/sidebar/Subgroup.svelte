<script lang="ts">
	import { groupToSearch, data, currentPage, textToSearch, totalPages } from '$lib/stores/store';
	import { get } from 'svelte/store';

	export let name;
	export let id;

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
		currentPage.set(1);
		totalPages.set(0);
		textToSearch.set(null);
		data.set(undefined);
		searchItems();
	}

	function toggle() {
		$groupToSearch = id;
		search();
	}
</script>

<span style="background-image: url(/image/group.png)" on:click={toggle}>{name}</span>

<style>
	span {
		padding: 0 0 0 1.5em;
		background: 0 0.1em no-repeat;
		background-size: 1em 1em;
		cursor: pointer;
	}
</style>
