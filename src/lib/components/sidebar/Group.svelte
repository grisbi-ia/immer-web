<script lang="ts">
	import Subgroup from './Subgroup.svelte';
	import { groupToSearch, data, currentPage, textToSearch, totalPages } from '$lib/stores/store';
	import { get } from 'svelte/store';
	import * as animateScroll from 'svelte-scrollto';

	export let expanded = false;
	export let name: string;
	export let id = null;
	export let groups = [];

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
		animateScroll.scrollToTop();
	}

	function toggle() {
		expanded = true;
		$groupToSearch = id;
		if (id === 'null') groupToSearch.set(undefined);
		search();
	}

	function colapse() {
		expanded = false;
	}
</script>

<span class:expanded on:click={toggle}>{name}</span>

{#if expanded}
	<colapse on:click={colapse}>🡩</colapse>
	<ul>
		{#each groups as group}
			<li>
				{#if group.groups}
					<svelte:self {...group} />
				{:else}
					<Subgroup {...group} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<style>
	span {
		padding: 0 0 0 1.5em;
		background: url(/image/group/folder.png) 0 0.1em no-repeat;
		background-size: 1em 1em;
		font-weight: bold;
		cursor: pointer;
	}

	.expanded {
		background-image: url(/image/group/folder-open.png);
	}

	ul {
		padding: 0.2em 0 0 0.5em;
		margin: 0 0 0 0.5em;
		list-style: none;
		border-left: 1px solid #eee;
	}

	li {
		padding: 0.2em 0;
	}

	colapse {
		padding: 0 0 0 1.5em;
		/*background: url(/image/folder.svg) 0 0.1em no-repeat;*/
		background-size: 1em 1em;
		font-weight: bold;
		cursor: pointer;
	}
</style>
