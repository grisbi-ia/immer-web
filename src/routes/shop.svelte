<script context="module" lang="ts">
	import {
		currentUser,
		token,
		data,
		currentPage,
		textToSearch,
		totalPages,
		groupToSearch,
		groups
	} from '$lib/stores/store';
	import { get } from 'svelte/store';
	import { getUserFromToken } from '../routes/api/jwt';

	export async function load({ fetch, params }) {
		groups.set(undefined);
		const resG = await (
			await fetch('../api/getItemGroups', {
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'GET'
			})
		).json();
		groups.set(await resG.objectList);

		data.set(undefined);
		currentPage.set(1);
		const res = await (
			await fetch('../api/postItems', {
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'POST',
				body: JSON.stringify({
					page: get(currentPage),
					textToSearch: get(textToSearch),
					groupToSearch: get(groupToSearch)
				})
			})
		).json();
		totalPages.set(await res.lastPage);
		data.set(await res.objectList);

		let response: Response;
		if (getUserFromToken()) {
			response = await fetch('../api/userInfo', {
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'POST',
				body: JSON.stringify({
					userName: `${getUserFromToken()}`,
					token: get(token)
				})
			});

			if (response.ok) {
				const responseJson = await response.json();
				const u = await responseJson.objectList[0];
				currentUser.set(u);
			}
		}

		return {
			props: {}
		};
	}
</script>

<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import MediaQuery from '$lib/util/MediaQuery.svelte';
	import ProductGrid from '$lib/components/ProductGrid.svelte';
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import { Modals, closeModal, openModal, modals } from 'svelte-modals';
</script>

<Header />
<div class="heading">
	<h1>Tienda</h1>
	<p><a href="/">Inicio >></a> Tienda</p>
</div>

<div class="wrapper">
	<MediaQuery query="(min-width: 769px)" let:matches>
		{#if matches}
			<div class="sidebar">
				<h3>Resultados</h3>
				<p>Páginas {$currentPage} / {$totalPages}</p>
				<br />
				<h3>Categorías</h3>
				<Sidebar />
			</div>
		{/if}
	</MediaQuery>

	{#key $data}
		<div class="main">
			<section class="product">
				<ProductGrid />
			</section>
		</div>
	{/key}
</div>

<Modals>
	<div slot="backdrop" class="backdrop" on:click={closeModal} />
</Modals>

<style>
	.backdrop {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		background: rgb(0 0 0 / 20%);
	}

	section {
		padding: 1%;
	}
	.wrapper {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	.main {
		width: 100%;

		top: 78px;
		margin: 1em;
		/*background-color: #f3f3f3;*/
	}

	.sidebar {
		font-size: 1.5rem;
		padding: 0px;
		background-color: #fff;
		width: 300px;
		/*height: 25vh;*/
		position: -webkit-sticky;
		position: sticky;
		/*top: 78px;*/
		top: 8rem;
		margin: 1em;
		max-height: calc(100vh - 9rem);
		overflow-y: auto;
	}
</style>
