<script>
	import Footer from "$lib/components/Footer.svelte";
	import Header from "$lib/components/Header.svelte";

	const handleImgGalleryError = (ev) => (ev.target.src = "image/gallery.jpg");
</script>

<!-- header section starts  -->
<Header />
<!-- header section ends -->

<div class="heading">
	<h1>Nosotros</h1>
	<p><a href="/home">Inicio >></a> Nosotros</p>
</div>

<section class="about">
	<div class="image">
		<img src="image/about-img.jpg" alt="" />
	</div>

	<div class="content">
		<span>Bienvenidos a IMMER</span>
		<h3>Lo mejor para tu moto</h3>
		<p>
			En IMMER contamos con los mejores productos para motocicletas, para
			que puedas mantener tu equipo funcionando perfectamente
		</p>
		<p>
			Somos una empresa dedicada a la distribucion y comercializacion de
			repuestos originales y accesorios para motocicletas, apoyados en un
			equipo humano calificado que con actitud de servicio y honestidad
			brinda asesoria perzonalizada y servicio tecnico, logrando asi la
			confianza de nuestros clientes para que nos reconozcan como una
			empresa de buen servicio y excelente calidad de trabajo.
		</p>
		<p>
			Desde el principio, nuestra visión es ser una empresa lider,
			respetada y fiable, obteniendo el mejor grado de satisfacción con la
			mejor calidad y tecnología, así como la mejor opción para los
			canales de distribución y para todos nuestros clientes nacionalmente
			a travez de la mejora continua de todos nuestros productos.
		</p>

		<h1>Llame o visítenos; ¡Estaras contento de haberlo hecho!</h1>

		<a href="/contact" class="btn">Contáctanos...</a>
	</div>
</section>

<section class="gallery">
	<h1 class="title">Nuestra <span>Galería</span></h1>
	<div class="box-container">
		<div class="box">
			<img
				src="image/gallery/gallery-1.jpg"
				alt=""
				on:error={handleImgGalleryError}
			/>
			<!--
			<div class="icons">
				<a href="/home" class="fas fa-eye" />
				<a href="/home" class="fas fa-heart" />
				<a href="/home" class="fas fa-share-alt" />
			</div>
			-->
		</div>

		<div class="box">
			<img
				src="image/gallery/gallery-2.jpg"
				alt=""
				on:error={handleImgGalleryError}
			/>
		</div>

		<div class="box">
			<img
				src="image/gallery/gallery-3.jpg"
				alt=""
				on:error={handleImgGalleryError}
			/>
		</div>

		<div class="box">
			<img
				src="image/gallery/gallery-4.jpg"
				alt=""
				on:error={handleImgGalleryError}
			/>
		</div>

		<div class="box">
			<img
				src="image/gallery/gallery-5.jpg"
				alt=""
				on:error={handleImgGalleryError}
			/>
		</div>
	</div>
</section>

<!-- footer section starts  -->
<Footer />
