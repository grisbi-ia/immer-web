<script lang="ts">
	import { showAlert } from '$lib/util/util';

	function subscribeEmail() {
		if (validateEmail(email))
			showAlert('success', 'Éxito', 'El correo fue registrado correctamente.');
		else showAlert('error', 'Error', 'Es necesario ingresar un correo válido');
	}
	function validateEmail(pEmail) {
		var emailRegEx =
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return emailRegEx.test(String(pEmail).toLowerCase());
	}
	let email: string = '';
</script>

<section class="footer">
	<div class="box-container">
		<div class="box">
			<h3>Enlaces</h3>
			<a href="/home"> <i class="fas fa-arrow-right" /> Inicio</a>
			<a href="/shop"> <i class="fas fa-arrow-right" /> Tienda</a>
		</div>

		<div class="box">
			<h3>Información</h3>
			<a href="/about"> <i class="fas fa-arrow-right" /> Nosotros</a>
			<a href="/contact"> <i class="fas fa-arrow-right" /> Contacto</a>
			<!--
			<a href="/home"> <i class="fas fa-arrow-right" /> Mis Compras </a>
			<a href="/home"> <i class="fas fa-arrow-right" /> Mi Cuenta </a>
			
			<a href="/home"> <i class="fas fa-arrow-right" /> Política de Privacidad </a>
			<a href="/home"> <i class="fas fa-arrow-right" /> Términos y Condiciones </a>
			-->
		</div>

		<div class="box">
			<h3>Síguenos</h3>
			<a
				href="https://www.facebook.com/IMMERimportaciones"
				target="_blank"
				rel="noopener noreferrer"
			>
				<i class="fab fa-facebook-f" /> Facebook
			</a>

			<a
				href="https://instagram.com/immerimportaciones?igshid=YmMyMTA2M2Y="
				target="_blank"
				rel="noopener noreferrer"
			>
				<i class="fab fa-instagram" /> Instagram
			</a>
			<!--
			<a href="/home"> <i class="fab fa-twitter" /> twitter </a>
			<a href="/home"> <i class="fab fa-instagram" /> instagram </a>
			<a href="/home"> <i class="fab fa-linkedin" /> linkedin </a>
			<a href="/home"> <i class="fab fa-pinterest" /> pinterest </a>
			-->
		</div>
		<!--
		<div class="box">
			<h3>Boletín Informativo</h3>
			<p>Suscríbete para recibir información de promociones</p>
			<form action="">
				<input type="email" placeholder="Ingresa tu correo" bind:value={email} />
				<input
					type="submit"
					value="Suscribir"
					class="btn"
					on:click|preventDefault={subscribeEmail}
				/>
			</form>
			<img src="image/payment.png" class="payment" alt="" />
		</div>
	-->
	</div>
</section>

<section class="credit">Creado por GRISBI | Todos los derechos reservados!</section>
