<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { toasts, ToastContainer, FlatToast } from 'svelte-toasts';

	const showAlert = (type, title, message) => {
		const toast = toasts.add({
			title: title,
			description: message,
			duration: 2000,
			placement: 'top-center',
			type: type,
			theme: 'dark',
			showProgress: true,
			onClick: () => {},
			onRemove: () => {}
		});
	};

	let username = '';
	let error = '';
	let recoveryRequestSend = false;
	let maskEmail = '';
	let passwordBean: Password = {
		oldPassword: '',
		newPassword: '',
		newRepeatPassword: '',
		resetPasswordCode: ''
	};

	let passwordChanged = false;
	async function changePassword() {
		const response = await fetch('../api/postResetPassword', {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({
				id: username,
				passwordBean: passwordBean
			})
		});

		const responseJson = await response.json();
		if (responseJson.status != '200') {
			error = responseJson.message;
			showAlert('error', 'Error', error);
		} else {
			passwordChanged = true;
			passwordBean.newPassword = '';
			passwordBean.oldPassword = '';
			passwordBean.newRepeatPassword = '';
			showAlert('success', 'Éxito', responseJson.message);
		}
	}

	async function recovery() {
		const response = await fetch('../api/postRecoveryPassword', {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({
				id: username
			})
		});

		const responseJson = await response.json();
		if (responseJson.status != '200') {
			error = responseJson.message;
			showAlert('error', 'Error', error);
		} else {
			showAlert('success', 'Éxito', responseJson.message);
			maskEmail = responseJson.objectList[0].maskedEmail;
			recoveryRequestSend = true;
		}
	}
</script>

<Header />

<div class="heading">
	<h1>Mi Perfil</h1>
	<p><a href="/">Inicio >></a> Mi Perfil</p>
</div>

<section class="about">
	<div class="content">
		<br />
		<br />
		<span>Contraseña Perdida</span>

		{#if !recoveryRequestSend}
			<p>
				¿Perdiste tu contraseña? Por favor, introduce tu nombre de usuario. Recibirás un código de
				seguridad en tu correo registrado, que te servirá para crear una contraseña nueva.
			</p>
			<table class="resume-table">
				<tbody>
					<tr>
						<td>
							<h2>Usuario</h2>
							<input type="text" bind:value={username} />
						</td>
					</tr>
				</tbody>
			</table>
			<input type="submit" value="Grabar" class="btn" on:click={recovery} />
		{:else if !passwordChanged}
			<p>
				{`Revisa tu correo ${maskEmail}, escribe el código de seguridad y la nueva contraseña`}
			</p>
			<table class="resume-table">
				<tbody>
					<tr>
						<td>
							<h2>Usuario</h2>
							<p>{username}</p>
						</td>
					</tr>
					<tr>
						<td colspan="2">
							<h2>Código de Seguridad *</h2>
							<input type="text" bind:value={passwordBean.resetPasswordCode} />
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
		{:else}
			<p>Su contraseña fue restablecida correctamente. Por favor vuelva a iniciar sesión.</p>
			<a href={'/shop'} class="btn">Ir a la tienda</a>
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

	.about .content .navbar a {
		font-size: 1.7rem;
		color: #666;
		margin: 0 2rem;
	}

	.about .content .navbar a:hover {
		color: #153889;
	}
</style>
