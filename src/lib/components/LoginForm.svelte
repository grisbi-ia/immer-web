<script lang="ts">
	import { showAlert } from "$lib/util/util";
	import { login } from "$lib/util/util";
	let credentials: Credentials = {
		username: "",
		password: "",
		token: "",
	};

	async function loginApp() {
		const m = await login(credentials);
		if (m === "OK")
			showAlert("success", "Login", "Inicio de sesión exitosa.");
		else showAlert("error", "Error", m);
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
						bind:value={credentials.username}
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
						bind:value={credentials.password}
					/>
				</td>
			</tr>
		</tbody>
	</table>
	<input type="submit" value="Ingresar" class="btn" on:click={loginApp} />
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
