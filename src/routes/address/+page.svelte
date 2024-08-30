<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import {
		currentUser,
		token,
		states,
		cities,
		districts,
	} from "$lib/stores/store";
	import LoginForm from "$lib/components/LoginForm.svelte";
	import {
		showAlert,
		getUserFromToken,
		reloadUserFromToken,
	} from "$lib/util/util";
	import { onMount } from "svelte";

	onMount(async () => {
		if (getUserFromToken()) {
			reloadUserFromToken();
		}
	});

	async function addAddress() {
		const districtBean: District = {
			districtId: 0,
			name: "",
			country: undefined,
			region: undefined,
			state: {
				stateId: 194,
				name: "",
				country: undefined,
				region: undefined,
			},
			city: {
				cityId: 496,
				name: "",
				country: undefined,
				region: undefined,
				state: undefined,
			},
		};
		const personAddress: PersonAddress = {
			alias: "",
			personAddressId: "",
			mainStreet: "####",
			secundaryStreet: "S/I",
			propertyNumber: "S/N",
			sector: "",
			reference: "",
			personAddressTypeId: "001",
			personAddressTypeName: "",
			disctrictBean: districtBean,
			homeTypeId: "001",
			homeTypeName: "",
			longitude: null,
			latitude: null,
			urbanization: "",
			isDefault: 0,
			personId: $currentUser.person.personId,
		};

		const responseFetch = await fetch("/api/person/address", {
			method: "POST",
			body: JSON.stringify({
				address: personAddress,
				token: $token,
			}),
		});

		const response = await responseFetch.json();
		if (response.status != "200") {
			showAlert("error", "Error", response.message);
		} else {
			showAlert("success", "Éxito", response.message);
			personAddress.personAddressId =
				response.objectList[0]!.personAddressId;
			$currentUser.person.addresses.push(personAddress);
			currentUser.set($currentUser);
		}
	}

	async function removeAddress(id: string) {
		const responseFetch = await fetch("/api/person/address", {
			method: "DELETE",
			body: JSON.stringify({
				id: id,
				token: $token,
			}),
		});

		const response = await responseFetch.json();
		if (response.status != "200") {
			showAlert("error", "Error", response.message);
		} else {
			showAlert("success", "Éxito", response.message);
			const remainingArr = $currentUser.person.addresses.filter(
				(data) => data.personAddressId != id,
			);
			$currentUser.person.addresses = remainingArr;
			currentUser.set($currentUser);
		}
	}

	async function updateAddress(id: string) {
		const responseFetch = await fetch("/api/person/address", {
			method: "PUT",
			body: JSON.stringify({
				address: $currentUser.person.addresses.find(
					(element) => element.personAddressId === id,
				),
				token: $token,
			}),
		});

		const response = await responseFetch.json();
		if (response.status != "200") {
			showAlert("error", "Error", response.message);
		} else {
			showAlert("success", "Éxito", response.message);
		}
	}

	function resetCity(address: PersonAddress) {
		let userCity = null;
		let userDistrict = null;
		const filteredCities = getCities(address.disctrictBean.state.stateId);
		if (filteredCities.length > 0) {
			userCity = filteredCities[0].cityId;
			address.disctrictBean.city.cityId = userCity;
			const filteredDistricts = getDistricts(userCity);
			if (filteredDistricts.length > 0) {
				userDistrict = filteredDistricts[0].districtId;
				address.disctrictBean.districtId = userDistrict;
			}
		}
	}

	function resetDistric(address: PersonAddress) {
		let userDistrict = null;
		const filteredDistricts = getDistricts(
			address.disctrictBean.city.cityId,
		);
		if (filteredDistricts.length > 0) {
			userDistrict = filteredDistricts[0].districtId;
			address.disctrictBean.districtId = userDistrict;
		}
	}

	function getStates() {
		if ($states) return $states;
		else return [];
	}
	function getCities(stateId: number) {
		const filteredCities = $cities?.filter(
			(o) => o.state.stateId === stateId,
		);
		if (filteredCities) return filteredCities;
		else return [];
	}

	function getDistricts(cityId: number) {
		const filteredDistricts = $districts?.filter(
			(o) => o.city.cityId === cityId,
		);
		if (filteredDistricts) return filteredDistricts;
		else return [];
	}
</script>

<Header />

<div class="heading">
	<h1>Mi Perfilssss</h1>
	<p><a href="/home">Inicio >></a> Mis Direcciones</p>
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
			<span>Mis Direcciones</span>

			{#if $currentUser.person.addresses.length > 0}
				{#each $currentUser.person.addresses as address}
					<table class="resume-table">
						<tbody>
							<tr>
								<td
									><h2>Alias</h2>
									<input
										type="text"
										class="full-width"
										placeholder="Casa, Trabajo, etc"
										bind:value={address.alias}
									/>
								</td>
								<td colspan="2">
									<div class="icons">
										<div
											id="login-btn"
											class="fas fa-save"
											on:click|preventDefault={() =>
												updateAddress(
													address.personAddressId,
												)}
										/>
										<div
											id="login-btn"
											class="fas fa-times"
											on:click|preventDefault={() =>
												removeAddress(
													address.personAddressId,
												)}
										/>
									</div>
								</td>
							</tr>
							<tr>
								<td>
									<h2>Provincia *</h2>

									<select
										class="full-width"
										name="select-state"
										id="select-state"
										bind:value={address.disctrictBean.state
											.stateId}
										on:change={() => resetCity(address)}
									>
										<option disabled
											>--Seleccionar Provincia--</option
										>
										{#each getStates() as state}
											<option value={state.stateId}
												>{state.name}</option
											>
										{/each}
									</select>
								</td>

								<td>
									<h2>Ciudad *</h2>
									<select
										class="full-width"
										name="select-city"
										id="select-city"
										bind:value={address.disctrictBean.city
											.cityId}
										on:change={() => resetDistric(address)}
									>
										<option disabled
											>--Seleccionar Ciudad--</option
										>

										{#each getCities(address.disctrictBean.state.stateId) as city}
											<option value={city.cityId}
												>{city.name}</option
											>
										{/each}
									</select>
								</td>

								<td>
									<h2>Parroquia *</h2>
									<select
										class="full-width"
										name="select-district"
										id="select-district"
										bind:value={address.disctrictBean
											.districtId}
									>
										<option disabled
											>--Seleccionar Parroquia--</option
										>
										{#each getDistricts(address.disctrictBean.city.cityId) as district}
											<option value={district.districtId}
												>{district.name}</option
											>
										{/each}
									</select>
								</td>
							</tr>
							<tr>
								<td
									><h2>Calle Principal *</h2>
									<input
										type="text"
										class="full-width"
										bind:value={address.mainStreet}
									/>
								</td>
								<td>
									<h2>Número de Casa</h2>
									<input
										type="text"
										class="full-width"
										bind:value={address.propertyNumber}
									/>
								</td>

								<td>
									<h2>Calle Secundaria</h2>
									<input
										type="text"
										class="full-width"
										bind:value={address.secundaryStreet}
									/>
								</td>
							</tr>
						</tbody>
					</table>

					<br />
					<br />
					<br />
				{/each}
			{:else}
				<h1>No address</h1>
			{/if}
			<input
				type="submit"
				value="+ Añadir Direccióń"
				class="btn"
				on:click={() => addAddress($currentUser.person.personId)}
			/>
		{:else}
			<LoginForm />
		{/if}
	</div>
</section>

<!-- footer section starts  -->
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
