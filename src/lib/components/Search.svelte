<script lang="ts">
	import { textToSearch } from "$lib/stores/store";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { animateScroll } from "svelte-scrollto-element";
	import { searchProducts } from "$lib/util/util";

	function search() {
		if ($page.url.pathname != "/shop") goto("/shop");
		animateScroll.scrollToTop();
		searchProducts(false);
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
	<label
		for="search-box"
		class="fas fa-search"
		on:click|preventDefault={search}
	/>
	<label
		for="search-box"
		class="fas fa-times"
		on:click|preventDefault={showSearchForm}
	/>
</form>
