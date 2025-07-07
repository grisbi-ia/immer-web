<script lang="ts">
    import {
        brands,
        selectedBrand,
        selectedGroup,
        selectedSubgroup,
        availableGroups,
        availableSubgroups,
        textToSearch,
        catalogLoading,
    } from "$lib/stores/store";
    import { searchProducts } from "$lib/util/util";
    import { animateScroll } from "svelte-scrollto-element";
    import { catalogRelations } from "$lib/utils/catalog-relations";
    import Select from "svelte-select";

    let isOpen = false;

    function handleBrandSelect(event: CustomEvent) {
        const brand = event.detail;

        if (brand) {
            // Convert to CatalogBrand
            const catalogBrand = catalogRelations.getBrandById(brand.id);
            if (!catalogBrand) return;

            // Set selected brand
            selectedBrand.set(catalogBrand);

            // Update available groups and subgroups
            const newGroups = catalogRelations.getAvailableGroups(
                catalogBrand.id,
            );
            const newSubgroups = catalogRelations.getAvailableSubgroups(
                catalogBrand.id,
            );

            availableGroups.set(newGroups);
            availableSubgroups.set(newSubgroups);

            // Reset incompatible selections
            const currentGroup = $selectedGroup;
            const currentSubgroup = $selectedSubgroup;

            if (
                currentGroup &&
                !catalogRelations.isValidCombination(
                    catalogBrand.id,
                    currentGroup.id,
                )
            ) {
                selectedGroup.set(null);
            }

            if (
                currentSubgroup &&
                !catalogRelations.isValidCombination(
                    catalogBrand.id,
                    undefined,
                    currentSubgroup.id,
                )
            ) {
                selectedSubgroup.set(null);
            }

            console.log("Brand selected:", {
                brand: catalogBrand.name,
                availableGroups: newGroups.length,
                availableSubgroups: newSubgroups.length,
            });
        } else {
            // Clear brand selection
            selectedBrand.set(null);

            // Reset to all options
            availableGroups.set(catalogRelations.getAllGroups());
            availableSubgroups.set(catalogRelations.getAllSubgroups());
        }

        // No resetear textToSearch - mantener búsqueda de texto
        // textToSearch.set(null); // Comentado para mantener el texto

        // Trigger search
        animateScroll.scrollToTop();
        searchProducts(false);
    }

    function clearBrandFilter() {
        selectedBrand.set(null);

        // Reset to all options
        availableGroups.set(catalogRelations.getAllGroups());
        availableSubgroups.set(catalogRelations.getAllSubgroups());

        // 🔄 CORREGIDO: NO limpiar otros filtros automáticamente
        // Los grupos y subgrupos deben mantenerse independientes
        // selectedGroup.set(null);      // ❌ Removido
        // selectedSubgroup.set(null);   // ❌ Removido

        searchProducts(false);
    }

    // Format brands for svelte-select
    $: formattedBrands = $brands.map((brand) => ({
        value: brand.id,
        label: brand.name,
        ...brand,
    }));

    // Format selected value for svelte-select
    $: selectedValue = $selectedBrand
        ? {
              value: $selectedBrand.id,
              label: $selectedBrand.name,
              ...$selectedBrand,
          }
        : null;

    $: hasValue = $selectedBrand !== null;
</script>

<div class="brand-filter-container">
    {#if $catalogLoading}
        <div class="loading-indicator">Cargando marcas...</div>
    {:else}
        <div
            class="select-container immer-select"
            class:open={isOpen}
            class:has-value={hasValue}
        >
            <Select
                items={formattedBrands}
                value={selectedValue}
                placeholder="🏷️ Seleccionar marca..."
                clearable={true}
                searchable={true}
                on:select={handleBrandSelect}
                on:clear={clearBrandFilter}
                on:open={() => (isOpen = true)}
                on:close={() => (isOpen = false)}
                --background="#fff"
                --border="1px solid #4238ca"
                --border-radius="4px"
                --height="40px"
                --font-size="1.4rem"
                --padding="0 1.2rem"
            />
        </div>
    {/if}
</div>

<style>
    .brand-filter-container {
        margin-bottom: 2rem;
        padding: 0;
    }

    .select-container {
        position: relative;
        margin-bottom: 1rem;
    }

    .loading-indicator {
        font-size: 1.2rem;
        color: #666;
        text-align: center;
        padding: 1rem 0;
    }

    /* Hide default svelte-select arrow */
    .immer-select :global(.svelte-select .indicators .indicator) {
        display: none;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .brand-filter-container {
            margin-bottom: 1.5rem;
        }
    }
</style>
