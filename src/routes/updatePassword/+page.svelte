<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import { currentUser, token } from "$lib/stores/store";
	import {
		showAlert,
		getUserFromToken,
		reloadUserFromToken,
	} from "$lib/util/util";
	import LoginForm from "$lib/components/LoginForm.svelte";
	import { onMount } from "svelte";

	onMount(async () => {
		if (getUserFromToken()) {
			reloadUserFromToken();
		}
	});

	let passwordBean: Password = {
		oldPassword: "",
		newPassword: "",
		newRepeatPassword: "",
		resetPasswordCode: "",
	};
	let passwordChanged = false;

	async function updatePassword() {
		const responseFetch = await fetch("/api/user/password", {
			method: "PUT",
			body: JSON.stringify({
				id: $currentUser?.id,
				password: passwordBean,
				token: $token,
			}),
		});

		const response = await responseFetch.json();
		if (response.status != "200") {
			showAlert("error", "Error", response.message);
		} else {
			passwordChanged = true;
			passwordBean.newPassword = "";
			passwordBean.oldPassword = "";
			passwordBean.newRepeatPassword = "";
			showAlert("success", "Éxito", response.message);
			currentUser.set($currentUser);
		}
	}
</script>

<Header />

<div class="heading">
	<h1>Mi Perfil</h1>
	<p><a href="/home">Inicio >></a> Mi Contraseña</p>
</div>

<section class="about">
	<div class="content">
		{#if $currentUser}
			<nav class="navbar">
				<a href="profile">Mi Perfil</a>
				<a href="address">Mis Direcciones</a>
				<a href="updatePassword">Mi Contraseña</a>
				<!--<a href="history">Historial de Compras</a>-->
			</nav>
			<br />
			<br />
			{#if passwordChanged}
				<h3>Su contraseña fue registrada correctamente.</h3>
				<br />
				<a href={"/shop"} class="btn">Ir a la tienda</a>
			{:else}
				<span>Cambiar mi contraseña</span>
				<table class="resume-table">
					<tbody>
						<tr>
							<td>
								<h2>Usuario</h2>
								<input
									type="text"
									readonly
									bind:value={$currentUser.id}
								/>
							</td>
							<td>
								<h2>UUID</h2>
								<input
									type="text"
									readonly
									bind:value={$currentUser.person.personId}
								/>
							</td>
						</tr>
						<tr>
							<td>
								<h2>Correo de Usuario</h2>
								<input
									type="text"
									readonly
									bind:value={$currentUser.email}
								/>
							</td>
							<td>
								<h2>Celular de Usuario</h2>
								<input
									type="text"
									readonly
									bind:value={$currentUser.cellPhoneNumber}
								/>
							</td>
						</tr>
						<tr>
							<td colspan="2">
								<h2>Correo Electrónico *</h2>
								<input
									type="text"
									readonly
									class="full-width"
									bind:value={$currentUser.email}
								/>
							</td>
						</tr>
						<tr>
							<td colspan="2">
								<h2>Contraseña Actual *</h2>
								<input
									type="password"
									bind:value={passwordBean.oldPassword}
								/>
							</td>
						</tr>
						<tr>
							<td colspan="2">
								<h2>Nueva Contraseña *</h2>
								<input
									type="password"
									bind:value={passwordBean.newPassword}
								/>
							</td>
						</tr>
						<tr>
							<td colspan="2">
								<h2>Repetir Nueva Contraseña *</h2>
								<input
									type="password"
									bind:value={passwordBean.newRepeatPassword}
								/>
							</td>
						</tr>
					</tbody>
				</table>
				<input
					type="submit"
					value="Grabar"
					class="btn"
					on:click={updatePassword}
				/>
			{/if}
		{:else}
			<LoginForm />
		{/if}
	</div>
</section>

<Footer />

<style>
	.resume-table {
		border: 1px solid #c0c0c0;
		border-collapse: collapse;
		padding: 5px;
	}
	.resume-table td {
		border: 1px solid #c0c0c0;
		padding: 5px;
	}

	.resume-table input {
		border: 0.1rem solid rgba(0, 0, 0, 0.3);
		font-size: 1.3rem;
		color: var(--black);
		padding: 0.8rem;
		background: rgba(0, 0, 0, 0.05);
	}
	.full-width {
		width: 100%;
	}

	.about .content .navbar a {
		font-size: 1.7rem;
		color: #666;
		margin: 0 2rem;
	}

	.about .content .navbar a:hover {
		color: #153889;
	}
</style>
