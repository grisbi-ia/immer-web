<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { currentUser, token } from '$lib/stores/store';
	import { toasts, ToastContainer, FlatToast } from 'svelte-toasts';
	import LoginForm from '$lib/components/LoginForm.svelte';

	const showAlert = (type, title, message) => {
		const toast = toasts.add({
			title: title,
			description: message,
			duration: 3000,
			placement: 'top-center',
			type: type,
			theme: 'dark',
			showProgress: true,
			onClick: () => {},
			onRemove: () => {}
		});
	};

	let passwordBean: Password = {
		oldPassword: '',
		newPassword: '',
		newRepeatPassword: '',
		resetPasswordCode: ''
	};
	let passwordChanged = false;
	async function changePassword() {
		const response = await fetch('../api/putPassword', {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'PUT',
			body: JSON.stringify({
				id: $currentUser.id,
				passwordBean: passwordBean,
				token: $token
			})
		});

		const responseJson = await response.json();
		if (responseJson.status != '200') {
			showAlert('error', 'Error', responseJson.message);
		} else {
			passwordChanged = true;
			passwordBean.newPassword = '';
			passwordBean.oldPassword = '';
			passwordBean.newRepeatPassword = '';
			showAlert('success', 'Éxito', responseJson.message);
			currentUser.set($currentUser);
		}
	}
</script>

<Header />

<div class="heading">
	<h1>Mi Perfil</h1>
	<p><a href="/">Inicio >></a> Mi Contraseña</p>
</div>

<section class="about">
	<div class="content">
		{#if $currentUser}
			<nav class="navbar">
				<a href="profile">Mi Perfil</a>
				<a href="address">Mis Direcciones</a>
				<a href="password">Mi Contraseña</a>
				<!--<a href="history">Historial de Compras</a>-->
			</nav>
			<br />
			<br />
			{#if passwordChanged}
				<h3>Su contraseña fue registrada correctamente.</h3>
				<br />
				<a href={'/shop'} class="btn">Ir a la tienda</a>
			{:else}
				<span>Cambiar mi contraseña</span>
				<table class="resume-table">
					<tbody>
						<tr>
							<td>
								<h2>Usuario</h2>
								<input type="text" readonly bind:value={$currentUser.id} />
							</td>
							<td>
								<h2>UUID</h2>
								<input type="text" readonly bind:value={$currentUser.person.personId} />
							</td>
						</tr>
						<tr>
							<td>
								<h2>Correo de Usuario</h2>
								<input type="text" readonly bind:value={$currentUser.email} />
							</td>
							<td>
								<h2>Celular de Usuario</h2>
								<input type="text" readonly bind:value={$currentUser.cellPhoneNumber} />
							</td>
						</tr>
						<tr>
							<td colspan="2">
								<h2>Correo Electrónico *</h2>
								<input type="text" readonly class="full-width" bind:value={$currentUser.email} />
							</td>
						</tr>
						<tr>
							<td colspan="2">
								<h2>Contraseña Actual *</h2>
								<input type="password" bind:value={passwordBean.oldPassword} />
							</td>
						</tr>
						<tr>
							<td colspan="2">
								<h2>Nueva Contraseña *</h2>
								<input type="password" bind:value={passwordBean.newPassword} />
							</td>
						</tr>
						<tr>
							<td colspan="2">
								<h2>Repetir Nueva Contraseña *</h2>
								<input type="password" bind:value={passwordBean.newRepeatPassword} />
							</td>
						</tr>
					</tbody>
				</table>
				<input type="submit" value="Grabar" class="btn" on:click={changePassword} />
			{/if}
		{:else}
			<LoginForm />
		{/if}
	</div>
</section>

<!-- footer section starts  -->
<Footer />

<ToastContainer let:data>
	<FlatToast {data} />
</ToastContainer>

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
