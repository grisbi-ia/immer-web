<script>
	import { token, textToSearch, cartProducts } from "$lib/stores/store";
	import { isValidToken } from "$lib/util/util";
	import Login from "$lib/components/Login.svelte";
	import Search from "$lib/components/Search.svelte";
	import SimpleCart from "$lib/components/SimpleCart.svelte";
	import Navbar from "$lib/components/Navbar.svelte";

	import UserNavbar from "./UserNavbar.svelte";

	let isAuth = false;
	$: if ($token || !$token) {
		isAuth = isValidToken();
	}

	let expandedLoginForm = false;
	let expandedCartForm = false;
	let expandedSearchForm = false;
	let expandedMenu = false;

	const hideLoginForm = (event) => {
		expandedLoginForm = false;
		expandedCartForm = false;
		expandedSearchForm = false;
		expandedMenu = false;
	};

	const showLoginForm = (event) => {
		expandedLoginForm = !expandedLoginForm;
		expandedCartForm = false;
		expandedSearchForm = false;
		expandedMenu = false;
	};
	const showCartForm = (event) => {
		expandedCartForm = !expandedCartForm;
		expandedLoginForm = false;
		expandedSearchForm = false;
		expandedMenu = false;
	};
	const showSearchForm = (event) => {
		expandedSearchForm = !expandedSearchForm;
		expandedLoginForm = false;
		expandedCartForm = false;
		expandedMenu = false;
	};
	const showMenu = (event) => {
		expandedMenu = !expandedMenu;
		expandedSearchForm = false;
		expandedLoginForm = false;
		expandedCartForm = false;
	};

	$: if ($textToSearch && $textToSearch.trim.length > 0)
		expandedSearchForm = true;
</script>

<div>
	<header class="header">
		<!--
		<a href="/home" class="logo"> <i class="fas fa-shopping-basket" /> IMMER</a>
		-->
		<a href="/home" class="logo">
			<img src={`image/logo.png`} alt="Inicio" width="60" />
		</a>
		<nav class="navbar">
			<a href="/home">Inicio</a>
			<a href="shop">Tienda</a>
			<a href="about">Nosotros</a>
			<a href="contact">Contacto</a>
		</nav>
		<div class="icons">
			<div
				id="menu-btn"
				class="fas fa-bars"
				on:click|preventDefault={showMenu}
			/>
			<div
				id="search-btn"
				title="Buscar Repuesto"
				class="fas fa-search"
				on:click|preventDefault={showSearchForm}
			/>
			{#if isAuth}
				<div
					id="cart-btn"
					title="Ver Carrito de Compras"
					class="fas fa-shopping-cart"
					on:click|preventDefault={showCartForm}
				/>
				<span>{$cartProducts.length}</span>
				<div
					id="login-btn"
					class="fas fa-user"
					on:click|preventDefault={showLoginForm}
				/>
			{:else}
				<div
					id="login-btn"
					title="Iniciar Sesión"
					class="fas fa-sign-in-alt"
					on:click|preventDefault={showLoginForm}
				/>
			{/if}
		</div>
		{#if expandedSearchForm}
			<Search showSearchForm={() => showSearchForm()} />
		{/if}
		{#if expandedLoginForm}
			{#if isAuth}
				<UserNavbar
					on:hideForm={hideLoginForm}
					showLoginForm={() => showLoginForm()}
				/>
			{:else}
				<Login
					on:hideForm={hideLoginForm}
					showLoginForm={() => showLoginForm()}
				/>
			{/if}
		{/if}
		{#if expandedCartForm}
			<SimpleCart showCartForm={() => showCartForm()} />
		{/if}
		{#if expandedMenu}
			<Navbar />
		{/if}
	</header>
</div>

<style>
</style>
