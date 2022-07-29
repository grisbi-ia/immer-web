<script context="module" lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { currentUser, token, identificationTypes } from '$lib/stores/store';
	import { toasts, ToastContainer, FlatToast } from 'svelte-toasts';
	import LoginForm from '$lib/components/LoginForm.svelte';

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

	export async function load({ fetch, params }) {
		identificationTypes.set(undefined);
		const resIT = await (
			await fetch('../api/getIdentificationTypes', {
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'GET'
			})
		).json();
		identificationTypes.set(await resIT.resJson.objectList);

		return {
			props: {}
		};
	}
</script>

<script lang="ts">
	const phoneTypes = [
		{ id: '001', name: 'CELULAR' },
		{ id: '002', name: 'FIJO' }
	];

	async function updateProfile() {
		const response = await fetch('../api/putPerson', {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'PUT',
			body: JSON.stringify({
				personBean: $currentUser.person,
				token: $token
			})
		});

		const responseJson = await response.json();
		if (responseJson.status != '200') {
			showAlert('error', 'Error', responseJson.message);
		} else {
			showAlert('success', 'Éxito', responseJson.message);
			currentUser.set($currentUser);
		}
	}

	async function addPhone(personId) {
		const personPhone: PersonPhone = {
			personPhoneId: '',
			typePhoneNumberId: '001',
			typePhoneNumberName: '',
			areaCode: '000',
			stateCode: '',
			extension: '',
			personAddressId: '',
			isDefault: 0,
			personId: $currentUser.person.personId,
			number: '########'
		};

		const response = await fetch('../api/phones', {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({
				personPhone: personPhone,
				token: $token
			})
		});

		const responseJson = await response.json();
		if (responseJson.status != '200') {
			showAlert('error', 'Error', responseJson.message);
		} else {
			showAlert('success', 'Éxito', responseJson.message);
			personPhone.personPhoneId = responseJson.objectList[0]!.personPhoneId;
			$currentUser.person.phones.push(personPhone);
			currentUser.set($currentUser);
		}
	}

	async function removePhone(id) {
		const response = await fetch('../api/deletePhone', {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({
				id: id,
				token: $token
			})
		});

		const responseJson = await response.json();
		if (responseJson.status != '200') {
			showAlert('error', 'Error', responseJson.message);
		} else {
			showAlert('success', 'Éxito', responseJson.message);
			const remainingArr = $currentUser.person.phones.filter((data) => data.personPhoneId != id);
			$currentUser.person.phones = remainingArr;
			currentUser.set($currentUser);
		}
	}

	async function updatePhone(id) {
		const response = await fetch('../api/phones', {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'PUT',
			body: JSON.stringify({
				personPhone: $currentUser.person.phones.find((element) => element.personPhoneId === id),
				token: $token
			})
		});

		const responseJson = await response.json();
		if (responseJson.status != '200') {
			showAlert('error', 'Error', responseJson.message);
		} else {
			showAlert('success', 'Éxito', responseJson.message);
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
		{#if $currentUser}
			<nav class="navbar">
				<a href="profile">Mi Perfil</a>
				<a href="address">Mis Direcciones</a>
				<a href="password">Mi Contraseña</a>
				<!--<a href="history">Historial de Compras</a>-->
			</nav>
			<br />
			<br />
			<span>Mi Perfil de Usuario</span>

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
				</tbody>
			</table>
			<br />
			<span>Mis Datos de Facturación</span>
			<table class="resume-table">
				<tbody>
					{#if $currentUser.person.personTypeId === 'NAT'}
						<tr>
							<td>
								<h2>Primer Nombre *</h2>
								<input type="text" bind:value={$currentUser.person.firstName} />
							</td>
							<td>
								<h2>Segundo Nombre</h2>
								<input type="text" bind:value={$currentUser.person.secondName} />
							</td>
						</tr>
						<tr>
							<td>
								<h2>Apellido Paterno *</h2>
								<input type="text" bind:value={$currentUser.person.paternalSurname} />
							</td>
							<td>
								<h2>Apellido Materno *</h2>
								<input type="text" bind:value={$currentUser.person.maternalSurname} />
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="2"
								><h2>Razón Social *</h2>
								<input type="text" class="full-width" bind:value={$currentUser.person.name} />
							</td>
						</tr>
					{/if}

					<tr>
						<td>
							<h2>Tipo de Identificación *</h2>
							<select
								class="full-width"
								name="select-ti"
								id="select-ti"
								bind:value={$currentUser.person.identificationTypeId}
							>
								{#each $identificationTypes as it}
									<option value={it.identificationTypeId} id={it.identificationTypeId}
										>{it.name}</option
									>
								{/each}
							</select>
						</td>
						<td
							><h2>Identificación *</h2>
							<input type="text" bind:value={$currentUser.person.identification} />
						</td>
					</tr>
					<tr>
						<td>
							<h2>Correo de Facturación *</h2>
							<input type="text" class="full-width" bind:value={$currentUser.person.email} />
						</td>
						{#if $currentUser.person.personTypeId === 'NAT'}
							<td>
								<h2>Fecha de Nacimiento</h2>
								<input
									type="date"
									class="full-width"
									bind:value={$currentUser.person.birthDateAsString}
								/>
							</td>
						{/if}
					</tr>
				</tbody>
			</table>
			<input type="submit" value="Grabar" class="btn" on:click={updateProfile} />
			<br />
			<br />
			<br />
			<span>Teléfonos</span>
			<table class="resume-table">
				<tbody>
					{#each $currentUser.person.phones as phone}
						<tr>
							<td>
								<h2>Tipo *</h2>
								<select
									class="full-width"
									name="select-tp"
									id="select-tp"
									bind:value={phone.typePhoneNumberId}
								>
									{#each phoneTypes as pt}
										<option value={pt.id} id={pt.id}>{pt.name}</option>
									{/each}
								</select>
							</td>
							<td>
								<h2>Número *</h2>
								<input type="text" bind:value={phone.number} />
							</td>
							<td>
								<div class="icons">
									<div
										id="login-btn"
										class="fas fa-save"
										on:click|preventDefault={() => updatePhone(phone.personPhoneId)}
									/>
									<div
										id="login-btn"
										class="fas fa-times"
										on:click|preventDefault={() => removePhone(phone.personPhoneId)}
									/>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<input
				type="submit"
				value="+ Añadir Teléfono"
				class="btn"
				on:click={() => addPhone($currentUser.person.personId)}
			/>
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
	.resume-table select {
		border: 0.1rem solid rgba(0, 0, 0, 0.3);
		font-size: 1.3rem;
		color: var(--black);
		padding: 0.8rem;
		background: rgba(0, 0, 0, 0.05);
	}
	.resume-table .icons div {
		font-size: 2.5rem;
		margin-left: 1.7rem;
		cursor: pointer;
		color: #666;
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
