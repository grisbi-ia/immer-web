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

<span style="background-image: url(/image/group.png)" on:click={toggle}
	>{name}</span
>

<style>
	span {
		padding: 0 0 0 1.5em;
		background: 0 0.1em no-repeat;
		background-size: 1em 1em;
		cursor: pointer;
	}
</style>
