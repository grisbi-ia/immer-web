<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import { showAlert } from "$lib/util/util";

	let subjectMessage = "";
	let bodyMessage = "";
	let nameMessage = "";
	let emailMessage = "";
	let celularPhoneMessage = "";

	let notification: EmailNotification = {
		subject: "",
		message: "",
		deliveredTo: "",
	};

	async function sendEmail() {
		notification.subject = `Mensaje desde Página WEB / ${nameMessage}`;
		notification.message = `<b>* Cliente:</b>${nameMessage}<br><b>* Teléfono:</b> ${celularPhoneMessage}<br><b>* Correo:</b> ${emailMessage}<br><b>* Asunto:</b> ${subjectMessage}<br><b>* Mensaje:</b><br />${bodyMessage}`;
		notification.deliveredTo = "info@immer.ec";
		console.log(notification);
		const response = await fetch("/api/contact", {
			method: "POST",
			body: JSON.stringify(notification),
		});

		const responseJson = await response.json();
		if (response.ok) {
			showAlert(
				"success",
				"Mensaje",
				"Gracias por tu mensaje. Te atenderemos de inmediato"
			);
		} else {
			showAlert("error", "Error", responseJson.message);
		}
	}
</script>

<Header />

<div class="heading">
	<h1>Contáctanos</h1>
	<p><a href="home.html">Inicio >></a> Contacto</p>
</div>

<section class="contact">
	<div class="icons-container">
		<div class="icons">
			<i class="fas fa-phone" />
			<h3>Teléfonos</h3>
			<a href="tel:+593987132802"><p>(+593) 0987132802</p></a>
		</div>

		<div class="icons">
			<i class="fas fa-envelope" />
			<h3>Correo</h3>
			<a href="mailto:info@immer.ec"><p>info@immer.ec</p></a>
		</div>

		<div class="icons">
			<i class="fas fa-map-marker-alt" />
			<h3>Dirección</h3>
			<p>Octavio Chacón y Miguel Ángel Narvaez, Esquina.</p>
			<p>Cuenca, Ecuador</p>
		</div>

		<div class="icons">
			<i class="fas fa-clock" />
			<h3>Horario</h3>
			<p>Lunes a Viernes</p>
			<p>8:00 am - 17:00 pm</p>
		</div>
	</div>

	<div class="row">
		<form on:submit|preventDefault={sendEmail}>
			<h3>Déjanos un Mensaje</h3>
			<div class="inputBox">
				<input
					type="text"
					placeholder="Tu nombre"
					class="box"
					bind:value={nameMessage}
				/>
				<input
					type="email"
					placeholder="Tu email"
					class="box"
					bind:value={emailMessage}
				/>
			</div>
			<div class="inputBox">
				<input
					type="number"
					placeholder="Tu número celular"
					class="box"
					bind:value={celularPhoneMessage}
				/>
				<input
					type="text"
					placeholder="Asunto"
					class="box"
					maxlength="50"
					bind:value={subjectMessage}
				/>
			</div>
			<textarea
				placeholder="Tu mensaje"
				cols="30"
				rows="10"
				bind:value={bodyMessage}
			/>
			<input type="submit" value="Enviar mensaje" class="btn" />
		</form>

		<iframe
			title="map"
			class="map"
			src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2817.667630169434!2d-78.97863975874094!3d-2.8786362976232924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91cd1783dee6e10b%3A0x1163434cb13e286b!2sOctavio%20Chac%C3%B3n%20Moscoso%20%26%20Miguel%20Angel%20Narv%C3%A1ez%2C%20Cuenca!5e0!3m2!1ses-419!2sec!4v1658836914510!5m2!1ses-419!2sec"
			loading="lazy"
		/>
	</div>
</section>

<Footer />
