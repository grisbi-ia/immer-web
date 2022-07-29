<script lang="ts">
	import { currentUser, token } from '$lib/stores/store';
	import { toasts } from 'svelte-toasts';

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
	let password = '';

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
				showAlert('error', 'Error', 'Token not found.');
			}
		} else {
			showAlert('error', 'Error', responseJson.message);
		}
	}
</script>

<div class="content">
	<span>Por favor inicie la sesión</span>

	<table class="resume-table">
		<tbody>
			<tr>
				<td colspan="2">
					<h2>Usuario</h2>
					<input
						type="text"
						placeholder="Ingresar su nombre de usuario"
						class="box"
						bind:value={username}
					/>
				</td>
			</tr>
			<tr>
				<td colspan="2">
					<h2>Contraseña</h2>
					<input
						type="password"
						placeholder="Ingresar su clave"
						class="box"
						bind:value={password}
					/>
				</td>
			</tr>
		</tbody>
	</table>
	<input type="submit" value="Ingresar" class="btn" on:click={login} />
</div>

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
</style>
