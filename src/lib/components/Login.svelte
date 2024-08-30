<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { login } from "$lib/util/util";
	import { showAlert } from "$lib/util/util";

	const dispatch = createEventDispatcher();
	function hideLoginForm() {
		dispatch("hideForm", {
			value: true,
		});
	}

	let error = "";

	let credentials: Credentials = {
		username: "",
		password: "",
		token: "",
	};

	async function loginApp() {
		const m = await login(credentials);
		if (m === "OK") {
			hideLoginForm();
			showAlert("success", "Login", "Inicio de sesión exitosa.");
		} else {
			error = m;
			showAlert("error", "Error", m);
		}
	}
	export let showLoginForm = () => {};
</script>

<form on:submit|preventDefault={loginApp} class="login-form active">
	<h3 class="close" on:click={showLoginForm}>x</h3>
	<h3>Ingreso</h3>
	<input
		type="text"
		placeholder="Ingrese su nombre de usuario"
		class="box"
		bind:value={credentials.username}
	/>
	<input
		type="password"
		placeholder="Ingrese su contraseña"
		class="box"
		bind:value={credentials.password}
	/>
	<!--
	<div class="remember">
		<input type="checkbox" name="" id="remember-me" />
		<label for="remember-me">remember me</label>
	</div>
	-->
	<input type="submit" value="Ingresar" class="btn" />
	<p>Recuperar contraseña? <a href="/recoveryPassword">click aquí</a></p>
	<!--<p>don't have an account? <a href="/home">create one</a></p>-->
	<div id="error_message" class="text-danger">
		<small>{error}</small>
	</div>
</form>

<style>
	.text-danger {
		color: rgb(156, 0, 0);
		font-size: 2rem;
	}
</style>
