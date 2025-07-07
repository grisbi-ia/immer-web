<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import NameFilter from "./NameFilter.svelte";
    import BrandFilter from "./BrandFilter.svelte";
    import GroupFilter from "./GroupFilter.svelte";
    import SubgroupFilter from "./SubgroupFilter.svelte";
    import {
        selectedBrand,
        selectedGroup,
        selectedSubgroup,
        catalogLoading,
        brands,
        availableGroups,
        availableSubgroups,
        // 🆕 NAVEGACIÓN PERSISTENTE
        products,
    } from "$lib/stores/store";
    import {
        CatalogRelations,
        catalogRelations,
    } from "$lib/utils/catalog-relations";
    import {
        shouldRestoreCatalogState,
        recentlyNavigatedFromShop,
        restoreCatalogState,
        // 🆕 NAVEGACIÓN PERSISTENTE
        searchProductsPersistent,
    } from "$lib/util/util";
    import { browser } from "$app/environment";

    // Use singleton instance

    // Debug info
    $: debugInfo = {
        brand: $selectedBrand?.name || "None",
        group: $selectedGroup?.name || "None",
        subgroup: $selectedSubgroup?.name || "None",
    };

    // Show debug in development
    $: if (
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
    ) {
        console.log("CatalogFilters Debug:", debugInfo);
    }

    onMount(async () => {
        await loadCatalogData();
    });

    async function loadCatalogData() {
        try {
            catalogLoading.set(true);

            // Load catalog relations
            await catalogRelations.loadCatalog();

            // Set initial data for all stores
            const allBrands = catalogRelations.getAllBrands();
            brands.set(allBrands.map((b) => ({ id: b.id, name: b.name })));
            availableGroups.set(catalogRelations.getAllGroups());
            availableSubgroups.set(catalogRelations.getAllSubgroups());

            console.log("Catalog loaded in CatalogFilters:", {
                brands: allBrands.length,
                groups: catalogRelations.getAllGroups().length,
                subgroups: catalogRelations.getAllSubgroups().length,
            });

            // 🆕 NAVEGACIÓN PERSISTENTE - DESHABILITADO: Evitar condición de carrera
            // La restauración se maneja exclusivamente desde shop/+page.svelte
            // if (browser) {
            //     const shouldRestore =
            //         shouldRestoreCatalogState() || recentlyNavigatedFromShop();
            //     if (shouldRestore) {
            //         console.log(
            //             "Attempting to restore catalog state after loading...",
            //         );
            //         const restored = await restoreCatalogState();
            //         if (restored) {
            //             updateAvailableOptionsAfterRestore();
            //         }
            //     }
            // }
            console.log(
                "🔧 CatalogFilters: Restoration logic disabled to prevent race conditions",
            );
        } catch (error) {
            console.error("Error loading catalog in CatalogFilters:", error);
            brands.set([]);
            availableGroups.set([]);
            availableSubgroups.set([]);
        } finally {
            catalogLoading.set(false);
        }
    }

    // 🆕 NAVEGACIÓN PERSISTENTE - Función para actualizar opciones disponibles después de restaurar
    export function updateAvailableOptionsAfterRestore() {
        const currentBrand = get(selectedBrand);
        const currentGroup = get(selectedGroup);

        if (currentBrand) {
            // Actualizar grupos disponibles para la marca
            const compatibleGroups = catalogRelations.getAvailableGroups(
                currentBrand.id,
            );
            availableGroups.set(compatibleGroups);

            // Actualizar subgrupos disponibles
            const compatibleSubgroups = catalogRelations.getAvailableSubgroups(
                currentBrand.id,
                currentGroup?.id,
            );
            availableSubgroups.set(compatibleSubgroups);
        } else if (currentGroup) {
            // Si hay grupo pero no marca, filtrar subgrupos por grupo
            const allSubgroups = catalogRelations.getAllSubgroups();
            const compatibleSubgroups = allSubgroups.filter(
                (sub) => sub.groupId === currentGroup.id,
            );
            availableSubgroups.set(compatibleSubgroups);
        }

        console.log("Updated available options after restore:", {
            brand: currentBrand?.name || "None",
            group: currentGroup?.name || "None",
            availableGroups: get(availableGroups).length,
            availableSubgroups: get(availableSubgroups).length,
        });
    }
</script>

<div class="catalog-filters">
    {#if $catalogLoading}
        <div class="loading-container">
            <div class="loader"></div>
            <p>Cargando filtros...</p>
        </div>
    {:else}
        <div class="filters-grid">
            <h3>Búsqueda por Filtros</h3>
            <br />
            <!-- Name/Text Search Filter -->
            <div class="filter-item">
                <NameFilter />
            </div>

            <!-- Brand Filter -->
            <div class="filter-item">
                <BrandFilter />
            </div>

            <!-- Group Filter 
            <div class="filter-item">
                <GroupFilter />
            </div>
            -->

            <!-- Subgroup Filter -->
            <div class="filter-item">
                <SubgroupFilter />
            </div>
        </div>
    {/if}
</div>

<style>
    .catalog-filters {
        margin-bottom: 0;
        padding: 1rem 0;
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem 0;
        color: #666;
    }

    .loader {
        border: 4px solid #f3f3f3;
        border-radius: 50%;
        border-top: 4px solid #4238ca;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .filters-grid {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    .filter-item {
        width: 100%;
    }

    .debug-panel {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        font-size: 1.2rem;
        color: #6c757d;
    }

    /* Desktop: Single column, full width */
    @media (min-width: 769px) {
        .filters-grid {
            display: flex;
            flex-direction: column;
            gap: 0;
        }

        .filter-item {
            width: 100%;
        }
    }

    /* Mobile: Stack vertically with smaller spacing */
    @media (max-width: 768px) {
        .catalog-filters {
            margin-bottom: 1.5rem;
        }

        .filters-grid {
            gap: 0;
        }
    }

    /* Global styles for svelte-select clear button */
    :global(.svelte-select .clear-select) {
        cursor: pointer !important;
    }

    :global(.svelte-select .clear-select:hover) {
        cursor: pointer !important;
        transform: scale(1.1);
        transition: transform 0.2s ease;
    }

    /* Additional selectors for different versions of svelte-select */
    :global(.svelte-select .indicators .clear-select) {
        cursor: pointer !important;
    }

    :global(.svelte-select .indicators .clear-select:hover) {
        cursor: pointer !important;
        opacity: 0.8;
        transform: scale(1.1);
        transition: all 0.2s ease;
    }

    /* Ensure any X or clear icon has pointer cursor */
    :global(.svelte-select .indicators svg) {
        cursor: pointer !important;
    }

    :global(.svelte-select .indicators .indicator) {
        cursor: pointer !important;
    }

    :global(.svelte-select .indicators .indicator:hover) {
        cursor: pointer !important;
        opacity: 0.7;
        transition: opacity 0.2s ease;
    }
</style>
