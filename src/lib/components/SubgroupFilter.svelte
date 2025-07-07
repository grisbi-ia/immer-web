<script lang="ts">
    import {
        selectedBrand,
        selectedGroup,
        selectedSubgroup,
        availableSubgroups,
        textToSearch,
        catalogLoading,
    } from "$lib/stores/store";
    import { searchProducts } from "$lib/util/util";
    import { animateScroll } from "svelte-scrollto-element";
    import { catalogRelations } from "$lib/utils/catalog-relations";
    import Select from "svelte-select";

    let isOpen = false;

    // Reactive values
    $: selectedValue = $selectedSubgroup
        ? {
              value: $selectedSubgroup.id,
              label: $selectedSubgroup.name,
              ...$selectedSubgroup,
          }
        : null;

    $: formattedSubgroups = $availableSubgroups.map((subgroup) => ({
        value: subgroup.id,
        label: subgroup.name,
        ...subgroup,
    }));

    $: hasValue = $selectedSubgroup !== null;
    $: disabled = $availableSubgroups.length === 0;

    function handleSubgroupSelect(event: CustomEvent) {
        const subgroup = event.detail;

        if (subgroup) {
            // Set selected subgroup
            selectedSubgroup.set(subgroup);

            // Auto-resolver solo el grupo padre (si es único)
            const parentGroup = catalogRelations.getGroupBySubgroup(
                subgroup.id,
            );

            // Update group selection only if group is unique
            if (parentGroup) {
                selectedGroup.set(parentGroup);
            }

            // NO auto-seleccionar marca al elegir subgrupo
            // Un subgrupo puede pertenecer a múltiples marcas
            // La marca seleccionada se mantiene si es compatible

            console.log("Subgroup selected:", {
                subgroup: subgroup.name,
                group: parentGroup?.name || "None",
                brandKept: $selectedBrand?.name || "None",
            });
        } else {
            // Clear subgroup selection
            selectedSubgroup.set(null);
        }

        // No resetear textToSearch - mantener búsqueda de texto
        // textToSearch.set(null); // Comentado para mantener el texto

        // Trigger search
        animateScroll.scrollToTop();
        searchProducts(false);
    }

    function clearSubgroupFilter() {
        selectedSubgroup.set(null);
        searchProducts(false);
    }
</script>

<div class="subgroup-filter-container">
    {#if $catalogLoading}
        <div class="loading-indicator">Cargando subgrupos...</div>
    {:else}
        <div
            class="select-container immer-select"
            class:open={isOpen}
            class:disabled
            class:has-value={hasValue}
        >
            <Select
                items={formattedSubgroups}
                value={selectedValue}
                placeholder={disabled
                    ? "📁 Seleccione grupo primero"
                    : "🔧 Seleccionar grupo..."}
                {disabled}
                clearable={true}
                searchable={true}
                on:select={handleSubgroupSelect}
                on:clear={clearSubgroupFilter}
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
    .subgroup-filter-container {
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

    /* Disabled state */
    .immer-select.disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .subgroup-filter-container {
            margin-bottom: 1.5rem;
        }
    }
</style>
