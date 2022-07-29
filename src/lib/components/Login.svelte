<script>
	import { token } from '../stores/store';
	import { createEventDispatcher } from 'svelte';
	import { currentUser } from '$lib/stores/store';

	const dispatch = createEventDispatcher();
	function hideLoginForm() {
		dispatch('hideForm', {
			value: true
		});
	}

	let username = '';
	let password = '';
	let error = '';
	async function login() {
		const response = await fetch('../api/login', {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({
				username: username,
				password: password
			})
		});

		const responseJson = await response.json();
		if (response.ok) {
			const tokenResponse = await responseJson.token;
			if (tokenResponse) {
				$token = tokenResponse;
				error = '';
				hideLoginForm();

				const responseU = await fetch('../api/userInfo', {
					headers: {
						'Content-Type': 'application/json'
					},
					method: 'POST',
					body: JSON.stringify({
						userName: username,
						token: $token
					})
				});

				if (responseU.ok) {
					const responseUJson = await responseU.json();
					const u = await responseUJson.objectList[0];
					currentUser.set(u);
				}
			} else {
				error = 'Token not found.';
			}
		} else {
			error = responseJson.message;
		}
	}

	export let showLoginForm = () => {};
</script>

<form on:submit|preventDefault={login} class="login-form active">
	<h3 class="close" on:click={showLoginForm}>x</h3>
	<h3>Ingreso</h3>
	<input type="text" placeholder="Ingrese su nombre de usuario" class="box" bind:value={username} />
	<input type="password" placeholder="Ingrese su contraseña" class="box" bind:value={password} />
	<!--
	<div class="remember">
		<input type="checkbox" name="" id="remember-me" />
		<label for="remember-me">remember me</label>
	</div>
	-->
	<input type="submit" value="Ingresar" class="btn" />
	<p>Recuperar contraseña? <a href="/recoveryPassword">click aquí</a></p>
	<!--<p>don't have an account? <a href="/">create one</a></p>-->
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
