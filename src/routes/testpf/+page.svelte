<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import { cities } from "$lib/stores/store";
</script>

<Header />

<div class="heading">
	<h1>Test</h1>
</div>

<section class="about">
	<div class="content">
		<br />
		<p>Ciudades</p>
		<div class="cart-list">
			{#each $cities as o}
				<p>{o.cityId} - {o.name} - {o.state.stateId}</p>
			{/each}
		</div>
	</div>
</section>

<!-- footer section starts  -->
<Footer />

<style>
</style>
