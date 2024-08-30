<script lang="ts">
	import {
		groupToSearch,
		currentGroupName,
		textToSearch,
	} from "$lib/stores/store";
	import { searchProducts } from "$lib/util/util";
	import { animateScroll } from "svelte-scrollto-element";

	export let name: string;
	export let id: any;
	function search() {
		animateScroll.scrollToTop();
		$textToSearch = null;
		searchProducts(false);
	}

	function toggle() {
		$groupToSearch = id;
		$currentGroupName = name;
		search();
	}
</script>

{#if $currentGroupName === name}
	<span style="background-color: lightblue" on:click={toggle}>
		{name}
	</span>
{:else}
	<span on:click={toggle}>
		{name}
	</span>
{/if}

<style>
	span {
		padding: 0 0 0 0;
		background: 0 0.1em no-repeat;
		background-size: 1em 1em;
		cursor: pointer;
	}
</style>
