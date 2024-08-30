<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import MediaQuery from "$lib/util/MediaQuery.svelte";
	import ProductGrid from "$lib/components/ProductGrid.svelte";
	import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
	import { Modals, closeModal } from "svelte-modals";
	import { onMount } from "svelte";
	//import Select from "svelte-select";
	import {
		data,
		currentPage,
		textToSearch,
		totalPages,
		totalRecords,
		groups,
		//subgroups,
		currentUser,
		loading,
		currentGroupName,
		groupToSearch,
		//message,
		//selectedValue1,
	} from "$lib/stores/store";
	import { animateScroll } from "svelte-scrollto-element";
	import {
		searchProducts,
		getUserFromToken,
		reloadUserFromToken,
	} from "$lib/util/util";

	let discount = 0;
	if ($currentUser && $currentUser.person?.discountRate > 0) {
		discount = $currentUser.person.discountRate;
	}

	groups.set([]);
	//subgroups.set([]);

	let newGroups: Group[] = [];
	let newSubgroups: Group[] = [];
	onMount(async () => {
		//fetch groups and subgroups
		const fethcGroupResponse = await fetch("/api/shop/groups", {
			method: "GET",
		});
		const responseGroup = await fethcGroupResponse.json();

		groups.set(await responseGroup.objectList);
		//newGroups = await responseGroup.objectList;
		//fetch products
		searchProducts(false);

		if (getUserFromToken()) {
			reloadUserFromToken();
		}
	});

	function search() {
		animateScroll.scrollToTop();
		groupToSearch.set("");
		currentGroupName.set("");
		searchProducts(false);
	}
	function loadMorePages() {
		$currentPage++;
		searchProducts(true);
	}
	/*
	let currentGroupId = "";
	let currentGroup: Group;
	let currentSubgroupId = "";
	let currentSubgroup: Group;

	function fillSubgroups() {
		const currentGroup = newGroups.find((o) => o.id === currentGroupId)!;
		newSubgroups = currentGroup.groups;
	}

	let items = ["One", "Two", "Three", "Four"];

	let selectValueObject;

	function onClick1(e) {
		// This does not update the dropdown like I would expect it to.
		$selectedValue1 = "Four";
	}
	*/
</script>

<Header />
<div class="heading">
	<h1>Tienda</h1>
	<p><a href="/home">Inicio >></a> Tienda</p>
</div>

<div class="wrapper">
	<MediaQuery query="(min-width: 769px)" let:matches>
		{#if matches}
			<div class="sidebar">
				<br />
				<h3>Buscar</h3>
				<form
					on:submit|preventDefault={search}
					class="search-form active"
				>
					<input
						type="text"
						placeholder="Buscar Repuesto..."
						id="search-box"
						bind:value={$textToSearch}
					/>
				</form>
				<button class="btn" on:click={search}> Buscar </button>
				<br />
				<br />
				<!--
				<h3>Filtros</h3>
				
				<Select {newGroups} bind:justValue={$selectedValue1} />

				<select
					class="full-width"
					name="select-group"
					id="select-group"
					bind:value={currentGroupId}
					on:change={() => fillSubgroups()}
				>
					<option disabled>--Seleccionar Grupo--</option>
					{#each newGroups as group}
						<option value={group.id}>{group.name}</option>
					{/each}
				</select>
				<select
					class="full-width"
					name="select-subgroup"
					id="select-subgroup"
					bind:value={currentSubgroupId}
				>
					<option disabled>--Seleccionar Subgrupo--</option>
					{#each newSubgroups as subgroup}
						<option value={subgroup.id}>{subgroup.name}</option>
					{/each}
				</select>
				-->
				<h3>Categorías</h3>
				<Sidebar />
			</div>
		{/if}
	</MediaQuery>

	{#key $data}
		<div class="main">
			<section class="product">
				{#if $currentGroupName && $currentGroupName != ""}
					<div class="div-center">
						<h2>Categoría Actual: {$currentGroupName}</h2>
					</div>
				{/if}
				{#if $loading}
					<div class="loader"></div>
					<div class="div-center">
						<h2>Cargando...</h2>
					</div>
				{/if}
				{#if $data && $data.length > 0}
					<ProductGrid />
					<div class="div-center">
						<h2>
							Página: {$currentPage} / {$totalPages}
						</h2>
						<h2>
							Items en pantalla: {$data.length} / {$totalRecords}
						</h2>
					</div>
					{#if $loading}
						<div class="div-center">
							<div class="loader"></div>
							<br />
							<h2>Cargando...</h2>
						</div>
					{:else if $currentPage < $totalPages}
						<div class="div-center">
							<button
								class="btn"
								on:click={() => loadMorePages()}
							>
								Cargar más {$currentGroupName &&
								$currentGroupName != ""
									? $currentGroupName
									: ""}...
							</button>
						</div>
					{:else}
						<div class="div-center">
							{#if $currentGroupName && $currentGroupName != ""}
								<h2>
									No hay más resultados para mostrar en la
									categoría {$currentGroupName}.
								</h2>
							{:else}
								<h2>No hay más resultados para mostrar.</h2>
							{/if}
						</div>
					{/if}
				{:else if !$loading}
					<div class="div-center">
						<h2>
							No se encuentraron productos con los filtros
							aplicados
						</h2>
					</div>
				{/if}
			</section>
		</div>
	{/key}
</div>

<Modals>
	<div slot="backdrop" class="backdrop" on:click={closeModal} />
</Modals>

<style>
	.div-center {
		margin: auto;
		text-align: center;
		padding-bottom: 10px;
		padding-top: 30px;
	}
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

	.search-form input {
		height: 100%;
		width: 100%;
		padding: 0 1.2rem;
		font-size: 1.6rem;
		color: #222;
		text-transform: none;
		border: 1px solid #4238ca;
	}

	.loader {
		margin: auto;
		border: 16px solid #f3f3f3;
		border-radius: 50%;
		border-top: 16px solid #4238ca;
		width: 100px;
		height: 100px;
		-webkit-animation: spin 1s linear infinite; /* Safari */
		animation: spin 1s linear infinite;
	}

	/* Safari */
	@-webkit-keyframes spin {
		0% {
			-webkit-transform: rotate(0deg);
		}
		100% {
			-webkit-transform: rotate(360deg);
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
