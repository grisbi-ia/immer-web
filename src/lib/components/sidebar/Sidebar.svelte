<script context="module" lang="ts">
	import { groups } from "$lib/stores/store";
</script>

<script>
	import Group from "./Group.svelte";
</script>

<Group name="Todas" id="null" groups={$groups} expanded />
