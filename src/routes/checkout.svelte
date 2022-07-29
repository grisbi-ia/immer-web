<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { currentUser, token } from '$lib/stores/store';
	import { toasts, ToastContainer, FlatToast } from 'svelte-toasts';
	import { totalCart, totalUnities, cartProducts } from '../lib/stores/store';
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

	$: totalAmount = $totalCart;
	$: quantityProduct = $cartProducts.length;
	$: countUnities = $totalUnities;

	let deliveryAddressId: string;

	let orderSale: Invoice = {
		posId: 'POS001',
		isExternal: 0,
		posName: undefined,
		channelId: undefined,
		code: undefined,
		id: undefined,
		accountInvoiceid: undefined,
		branchId: 1,
		branchName: undefined,
		totalAmount: 0,
		balance: 0,
		paymentValue: 0,
		issueDate: undefined,
		collectedDate: undefined,
		dueDate: undefined,
		personId: undefined,
		offRoute: false,
		remark: undefined,
		priceListId: 'A',
		collectionBox: undefined,
		name: undefined,
		voucher: undefined,
		authorizeInvoice: undefined,
		person: undefined,
		paymentTypeId: 'PPD',
		paymentTypeName: undefined,
		personAddressId: undefined,
		reportId: undefined,
		oxusersSalesExecutive: undefined
	};

	let detail: Detail;
	let details: Detail[] = [];
	let orderFinish = false;
	let orderId: string;

	let error = '';

	async function createOrderSale() {
		orderSale.personId = $currentUser.person.personId;
		orderSale.oxusersSalesExecutive = $currentUser.person.salesExecutive;
		orderSale.personAddressId = deliveryAddressId;

		$cartProducts.forEach((e) => {
			detail = { id: e.id, cartCount: e.availibilityCount };
			details.push(detail);
		});

		const response = await fetch('../api/postOrderSale', {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({
				orderSale: orderSale,
				token: $token
			})
		});

		const responseJson = await response.json();

		if (responseJson.status != '200') {
			error = responseJson.message;
			showAlert('error', 'Error', error);
		} else {
			showAlert('success', 'Éxito', responseJson.message);
			orderId = responseJson.objectList[0].id;

			const responseDetail = await fetch('../api/postDetailsOrderSale', {
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'POST',
				body: JSON.stringify({
					orderId: orderId,
					details: details,
					token: $token
				})
			});

			const responseDetailJson = await responseDetail.json();
			if (responseJson.status != '200') {
				error = responseDetailJson.message;
				showAlert('error', 'Error', error);

				const responseCancelOrder = await fetch('../api/postCancelOrderSale', {
					headers: {
						'Content-Type': 'application/json'
					},
					method: 'POST',
					body: JSON.stringify({
						orderId: orderId,
						token: $token
					})
				});

				const responseCancelOrderJson = await responseCancelOrder.json();
				showAlert('info', 'Información', responseCancelOrderJson.message);
			} else {
				orderFinish = true;
				$cartProducts = [];
				totalAmount = 0;
				countUnities = 0;
				showAlert('success', 'Éxito', responseDetailJson.message);
			}
		}
	}
</script>

<ToastContainer let:data>
	<FlatToast {data} />
</ToastContainer>

<Header />

<div class="heading">
	<h1>Finalizar Compra</h1>
	<p><a href="/">Inicio >></a> Finalizar Compra</p>
</div>

<section class="about">
	<div class="content">
		{#if $currentUser}
			{#if orderFinish}
				<h3>Su pedido No. {orderId} fue registrado.</h3>
				<p>
					A continuación nuestro equipo de ventas se contactará con Ud, para finalizar su pedido
				</p>
				<p>Muchas gracias...</p>
				<br />
				<a href={'/shop'} class="btn">Ir a la tienda</a>
			{:else}
				{#if $cartProducts && $cartProducts.length > 0}
					<h3>Resumen:</h3>
					<p />
					<table class="resume-table">
						<tbody>
							<tr>
								<td><h2>Cantidad de Items:</h2></td>
								<td><p>{quantityProduct}</p></td>
							</tr>
							<tr>
								<td><h2>Número de Unidades:</h2></td>
								<td><p>{countUnities}</p></td>
							</tr>
							<tr>
								<td><h2>Total :</h2></td>
								<td
									><p>
										${totalAmount.toFixed(2)}
										(Valores incluyen impuestos)
									</p></td
								>
							</tr>
						</tbody>
					</table>
					<p />
				{:else}
					<h3>Tu carrito de compras está vacío.</h3>
					<br />
					<a href={'/shop'} class="btn">Ir a la tienda</a>
				{/if}

				<h3>Datos para Facturación:</h3>
				<p />
				<table class="resume-table">
					<tbody>
						{#if $currentUser.person.personTypeId === 'NAT'}
							<tr>
								<td><h2>Apellidos y Nombres</h2></td>
								<td><p>{$currentUser.person.name}</p></td>
							</tr>
						{:else}
							<tr>
								<td><h2>Razón Social</h2></td>
								<td><p>{$currentUser.person.name}</p></td>
							</tr>
						{/if}
						<tr />
						<tr>
							<td><h2>Identificación</h2></td>
							<td><p>{$currentUser.person.identification}</p></td>
						</tr>
						<tr>
							<td><h2>Correo Electrónico</h2></td>
							<td><p>{$currentUser.person.email}</p></td>
						</tr>
						<tr>
							<td><h2>Teléfonos</h2></td>
							<td
								><p>
									{Array.prototype.map
										.call($currentUser.person.phones, function (item) {
											return item.number;
										})
										.join(', ')}
								</p></td
							>
						</tr>
						<tr>
							<td colspan="2">
								<h2>Dirección de Entrega</h2>
								<select
									class="full-width"
									name="select-a"
									id="select-a"
									bind:value={deliveryAddressId}
								>
									{#each $currentUser.person.addresses as o}
										<option value={o.personAddressId} id={o.personAddressId}
											>{o.alias
												? o.alias + ', '
												: '' +
												  o.mainStreet +
												  ', ' +
												  o.disctrictBean.city.name +
												  '-' +
												  o.disctrictBean.state.name}</option
										>
									{/each}
								</select>
							</td>
						</tr>
					</tbody>
				</table>
				<input type="submit" value="Grabar" class="btn" on:click={createOrderSale} />
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
	.resume-table select {
		border: 0.1rem solid rgba(0, 0, 0, 0.3);
		font-size: 1.3rem;
		color: var(--black);
		padding: 0.8rem;
		background: rgba(0, 0, 0, 0.05);
	}
	.full-width {
		width: 100%;
	}
</style>
