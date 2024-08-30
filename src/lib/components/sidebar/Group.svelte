<script lang="ts">
	import Subgroup from "./Subgroup.svelte";
	import {
		currentGroupName,
		groupToSearch,
		textToSearch,
	} from "$lib/stores/store";
	import { animateScroll } from "svelte-scrollto-element";
	import { searchProducts } from "$lib/util/util";

	export let expanded = false;
	export let name: string;
	export let id: string | null = null;
	export let groups: Group[] = [];

	function search() {
		animateScroll.scrollToTop();
		$textToSearch = null;
		searchProducts(false);
	}

	function toggle() {
		expanded = !expanded;
		$groupToSearch = id;
		if (id === "null") {
			expanded = true;
			groupToSearch.set("");
			currentGroupName.set("");
			search();
		}
	}

	function colapse() {
		expanded = false;
	}
</script>

<span class:expanded on:click={toggle}>{name}</span>

{#if expanded}
	{#if id != "null"}
		<colapse on:click={colapse}>🡩</colapse>
	{/if}
	<ul>
		{#each groups as group}
			<li>
				{#if group.groups}
					<svelte:self {...group} />
				{:else}
					<Subgroup {...group} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<style>
	span {
		padding: 0 0 0 1.5em;
		background: url(/image/group/folder.png) 0 0.1em no-repeat;
		background-size: 1em 1em;
		font-weight: bold;
		cursor: pointer;
	}

	.expanded {
		background-image: url(/image/group/folder-open.png);
	}

	ul {
		padding: 0.2em 0 0 0.5em;
		margin: 0 0 0 0.5em;
		list-style: none;
		border-left: 1px solid #eee;
	}

	li {
		padding: 0.2em 0;
	}

	colapse {
		padding: 0 0 0 1.5em;
		/*background: url(/image/folder.svg) 0 0.1em no-repeat;*/
		background-size: 1em 1em;
		font-weight: bold;
		cursor: pointer;
	}
</style>
