<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import MediaQuery from "$lib/util/MediaQuery.svelte";
	import ProductGrid from "$lib/components/ProductGrid.svelte";
	import CatalogFilters from "$lib/components/CatalogFilters.svelte";
	import { Modals, closeModal } from "svelte-modals";
	import { onMount, onDestroy } from "svelte";
	import {
		data,
		currentPage,
		textToSearch,
		totalPages,
		totalRecords,
		currentUser,
		loading,
		// New catalog filters
		selectedBrand,
		selectedGroup,
		selectedSubgroup,
		// 🆕 NAVEGACIÓN PERSISTENTE
		products,
		hasMoreProducts,
		catalogScrollPosition,
	} from "$lib/stores/store";
	import { animateScroll } from "svelte-scrollto-element";
	import {
		searchProducts,
		searchProductsPersistent,
		getUserFromToken,
		reloadUserFromToken,
		// 🆕 NAVEGACIÓN PERSISTENTE
		restoreCatalogState,
		saveCatalogScrollPosition,
		clearCatalogState,
		shouldRestoreCatalogState,
		recentlyNavigatedFromShop,
		markNavigationFromShop,
		// 🆕 DEBUGGING
		debugAppState,
		testPaginationRestore,
		checkCurrentState,
	} from "$lib/util/util";
	import { browser } from "$app/environment";

	let discount = 0;
	if ($currentUser && $currentUser.person?.discountRate > 0) {
		discount = $currentUser.person.discountRate;
	}

	// 🆕 NAVEGACIÓN PERSISTENTE - Control de restauración
	let restoringState = false;
	let scrollSaveInterval: NodeJS.Timeout;
	let catalogInitialized = false;

	onMount(async () => {
		if (browser) {
			// Recargar usuario si está logueado
			if (getUserFromToken()) {
				await reloadUserFromToken();
			}

			// Configurar guardado automático de posición de scroll
			scrollSaveInterval = setInterval(() => {
				saveCatalogScrollPosition();
			}, 2000);

			// Determinar si debemos restaurar estado
			const shouldRestore =
				shouldRestoreCatalogState() || recentlyNavigatedFromShop();
			restoringState = shouldRestore;

			console.log("Shop page mounted:", {
				shouldRestore,
				recentNavigation: recentlyNavigatedFromShop(),
				currentProductsCount: $products.length,
			});

			// 🆕 DEBUGGING - Hacer funciones disponibles globalmente en desarrollo
			if (
				typeof window !== "undefined" &&
				window.location.hostname === "localhost"
			) {
				(window as any).debugAppState = debugAppState;
				(window as any).testPaginationRestore = testPaginationRestore;
				(window as any).checkCurrentState = checkCurrentState;
				(window as any).restoreCatalogState = restoreCatalogState;
				console.log(
					"🔧 Debug functions available: debugAppState(), testPaginationRestore(), checkCurrentState(), restoreCatalogState()",
				);
			}

			// Esperar un momento para que se cargue el catálogo en CatalogFilters
			setTimeout(async () => {
				console.log(
					"🔧 About to start restoration logic, current state:",
				);
				console.log("shouldRestore:", shouldRestore);
				console.log("currentPage before restoration:", $currentPage);
				console.log(
					"products length before restoration:",
					$products.length,
				);

				if (shouldRestore) {
					console.log("Attempting to restore catalog state...");
					const restored = await restoreCatalogState();
					console.log("Restoration result:", restored);
					console.log(
						"currentPage after restoration attempt:",
						$currentPage,
					);

					if (!restored) {
						// Si no se pudo restaurar, hacer búsqueda inicial
						console.log(
							"Could not restore, performing initial search",
						);
						await searchProductsPersistent(false);
					}
				} else {
					// Nueva sesión o no hay estado que restaurar
					console.log(
						"No restoration needed, performing initial search",
					);
					await searchProductsPersistent(false);
				}

				console.log("🔧 Final state after all operations:");
				console.log("currentPage:", $currentPage);
				console.log("products length:", $products.length);

				catalogInitialized = true;

				// Esperar un poco más antes de quitar el indicador de restauración
				setTimeout(() => {
					restoringState = false;
				}, 1500);
			}, 500);
		}
	});

	onDestroy(() => {
		// Limpiar interval al destruir componente
		if (scrollSaveInterval) {
			clearInterval(scrollSaveInterval);
		}

		// Guardar posición final de scroll
		if (browser) {
			saveCatalogScrollPosition();
		}
	});

	function loadMorePages() {
		$currentPage++;
		searchProductsPersistent(false);
	}

	// 🆕 NAVEGACIÓN PERSISTENTE - Función mejorada de cargar más
	function loadMoreProducts() {
		if (!$loading && $hasMoreProducts) {
			$currentPage++;
			searchProductsPersistent(true);
		}
	}

	// 🆕 NAVEGACIÓN PERSISTENTE - Detectar cuando se sale de la página
	function handleBeforeUnload() {
		saveCatalogScrollPosition();
	}

	// 🆕 NAVEGACIÓN PERSISTENTE - Detectar navegación con el browser
	function handlePageShow(event: PageTransitionEvent) {
		// Si la página se muestra desde caché del browser, restaurar estado
		if (event.persisted) {
			console.log(
				"Page shown from browser cache, attempting state restore",
			);
			restoreCatalogState();
		}
	}
</script>

<!-- 🆕 NAVEGACIÓN PERSISTENTE - Event listeners para detectar salida de página -->
<svelte:window
	on:beforeunload={handleBeforeUnload}
	on:pageshow={handlePageShow}
/>

<Header />
<div class="heading">
	<h1>Tienda</h1>
	<p><a href="/home">Inicio >></a> Tienda</p>
</div>

<div class="wrapper">
	<MediaQuery query="(min-width: 769px)" let:matches>
		{#if matches}
			<div class="sidebar">
				<!-- Catalog Filters Component (Name + Brand + Group + Subgroup) -->
				<CatalogFilters />
			</div>
		{/if}
	</MediaQuery>

	{#key $data}
		<div class="main">
			<section class="product">
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
							Items cargados: {$products.length} / {$totalRecords}
						</h2>
						{#if restoringState}
							<p style="color: #4238ca; font-size: 1.2rem;">
								📍 Estado de navegación restaurado
							</p>
						{/if}
					</div>
					{#if $loading}
						<div class="div-center">
							<div class="loader"></div>
							<br />
							<h2>Cargando...</h2>
						</div>
					{:else if $hasMoreProducts}
						<div class="div-center">
							<button
								class="btn"
								on:click={() => loadMoreProducts()}
								disabled={$loading}
							>
								{$loading ? "Cargando..." : "Cargar más"}
							</button>
						</div>
					{:else}
						<div class="div-center">
							<h2>No hay más resultados para mostrar</h2>
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
		padding: 1rem;
		background-color: #fff;
		width: 300px;
		position: -webkit-sticky;
		position: sticky;
		top: 8rem;
		margin: 1em;
		max-height: calc(100vh - 9rem);
		overflow-y: auto;
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

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.sidebar {
			padding: 0.5rem;
		}
	}
</style>
