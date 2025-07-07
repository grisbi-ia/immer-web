<script lang="ts">
    import {
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

    // Reactive values
    $: selectedValue = $selectedGroup
        ? {
              value: $selectedGroup.id,
              label: $selectedGroup.name,
              ...$selectedGroup,
          }
        : null;

    $: formattedGroups = $availableGroups.map((group) => ({
        value: group.id,
        label: group.name,
        ...group,
    }));

    $: hasValue = $selectedGroup !== null;
    $: disabled = true; // 🔒 SOLO LECTURA - Campo de grupo deshabilitado

    function handleGroupSelect(event: CustomEvent) {
        const group = event.detail;

        if (group) {
            // Set selected group
            selectedGroup.set(group);

            // Update available subgroups
            const currentBrand = $selectedBrand;
            const newSubgroups = catalogRelations.getAvailableSubgroups(
                currentBrand?.id,
                group.id,
            );
            availableSubgroups.set(newSubgroups);

            // Reset subgroup if not compatible
            const currentSubgroup = $selectedSubgroup;
            if (currentSubgroup && currentSubgroup.groupId !== group.id) {
                selectedSubgroup.set(null);
            }

            // NO auto-seleccionar marca al elegir grupo
            // Un grupo puede pertenecer a múltiples marcas
            // La marca seleccionada se mantiene si es compatible

            console.log("Group selected:", {
                group: group.name,
                availableSubgroups: newSubgroups.length,
                brandKept: currentBrand?.name || "None",
            });
        } else {
            // Clear group selection
            selectedGroup.set(null);

            // Update available subgroups
            const currentBrand = $selectedBrand;
            const newSubgroups = catalogRelations.getAvailableSubgroups(
                currentBrand?.id,
            );
            availableSubgroups.set(newSubgroups);
        }

        // No resetear textToSearch - mantener búsqueda de texto
        // textToSearch.set(null); // Comentado para mantener el texto

        // Trigger search
        animateScroll.scrollToTop();
        searchProducts(false);
    }

    function clearGroupFilter() {
        selectedGroup.set(null);

        // Update available subgroups
        const currentBrand = $selectedBrand;
        const newSubgroups = catalogRelations.getAvailableSubgroups(
            currentBrand?.id,
        );
        availableSubgroups.set(newSubgroups);

        // Clear subgroup if selected
        selectedSubgroup.set(null);

        searchProducts(false);
    }
</script>

<div class="group-filter-container">
    {#if $catalogLoading}
        <div class="loading-indicator">Cargando grupos...</div>
    {:else}
        <div
            class="select-container immer-select"
            class:open={isOpen}
            class:disabled
            class:has-value={hasValue}
        >
            <Select
                items={formattedGroups}
                value={selectedValue}
                placeholder={disabled
                    ? "🔒 Grupo..."
                    : "📁 Seleccionar grupo..."}
                {disabled}
                clearable={true}
                searchable={true}
                on:select={handleGroupSelect}
                on:clear={clearGroupFilter}
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
    .group-filter-container {
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
        .group-filter-container {
            margin-bottom: 1.5rem;
        }
    }
</style>
