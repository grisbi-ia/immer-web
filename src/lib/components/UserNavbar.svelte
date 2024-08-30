<script>
	import { currentUser, token } from "$lib/stores/store";
	import { getUserFromToken, isValidToken } from "$lib/util/util";
	import { createEventDispatcher } from "svelte";

	let isAuth = false;
	$: if ($token || !$token) {
		isAuth = isValidToken();
	}

	const dispatch = createEventDispatcher();
	function hideLoginForm() {
		dispatch("hideForm", {
			value: true,
		});
	}

	let error = "";
	async function logout() {
		const res = await (
			await fetch("/api/user/logout", {
				method: "POST",
				body: JSON.stringify({
					username: getUserFromToken(),
				}),
			})
		).json();

		if (isAuth) {
			$token = null;
			$currentUser = null;
			hideLoginForm();
			if (error) error = "";
		} else {
			error = "No existe inicio de sesion.";
		}
	}

	export let showLoginForm = () => {};
</script>

<form on:submit|preventDefault={logout} class="user-navbar active">
	<h3 class="close" on:click={showLoginForm}>x</h3>

	<h3>Hola {getUserFromToken()}</h3>
	<br />

	<a href="/profile"> <i class="fas fa-arrow-right" /> Mi Perfil</a>
	<a href="/address"> <i class="fas fa-arrow-right" /> Direcciones</a>
	<a href="/updatePassword"> <i class="fas fa-arrow-right" /> Contraseña</a>
	<!--<a href={'/profile'}> <i class="fas fa-arrow-right" /> Historial de Compras</a>-->
	<input type="submit" value="Cerrar Sesión" class="btn" />
	<div id="error_message" class="text-danger">
		<small>{error}</small>
	</div>
</form>

<style>
	.user-navbar {
		position: absolute;
		top: 115%;
		right: -105%;
		background: #fff;
		border-radius: 0.5rem;
		-webkit-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
		box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
		width: 35rem;
		padding: 2rem;
	}

	.user-navbar .close {
		color: #666;
		text-align: right;
		font-size: 2.2rem;
		cursor: pointer;
	}

	.user-navbar.active {
		right: 2rem;
		-webkit-transition: 0.4s linear;
		transition: 0.4s linear;
	}

	.user-navbar h3 {
		color: #222;
		text-transform: uppercase;
		font-size: 2.2rem;
		text-align: center;
		margin-bottom: 0.7rem;
	}

	.user-navbar .btn {
		margin: 1rem 0;
		width: 100%;
		text-align: center;
	}
	/*
	.user-navbar p {
		color: #666;
		padding-top: 0.7rem;
		font-size: 1.4rem;
	}
*/
	.user-navbar p a {
		color: #153889;
	}

	.user-navbar p a:hover {
		text-decoration: underline;
	}

	.user-navbar a {
		font-size: 1.4rem;
		color: #666;
		padding: 1rem 0;
		display: block;
	}

	.user-navbar a:hover {
		color: #153889;
	}

	.user-navbar a:hover i {
		padding-right: 2rem;
	}

	.user-navbar a i {
		padding-right: 0.5rem;
		color: #153889;
	}
</style>
