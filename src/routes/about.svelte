<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	const handleImgGalleryError = (ev) => (ev.target.src = 'image/gallery.jpg');
</script>

<!-- header section starts  -->
<Header />
<!-- header section ends -->

<div class="heading">
	<h1>Nosotros</h1>
	<p><a href="/">Inicio >></a> Nosotros</p>
</div>

<section class="about">
	<div class="image">
		<img src="image/about-img.jpg" alt="" />
	</div>

	<div class="content">
		<span>Bienvenidos a IMMER</span>
		<h3>Lo mejor para tu moto</h3>
		<p>
			IMMER Ecuador es propiedad y está operada por entusiastas de las motos que comparten su
			entusiasmo y aprecio por la conducción.
		</p>
		<p>
			Desde el principio, nuestra visión ha sido proporcionar a nuestros clientes los mejores
			productos, repuestos y servicios para sus necesidades de deportes motorizados, tanto dentro
			como fuera de la carretera.
		</p>
		<p>
			Contamos con un catálogo de 5000 partes, lo que nos permitió ampliar nuestra visión y brindar
			a los clientes aún más opciones y un servicio mejor y más rápido. El crecimiento de vendedores
			a nivel nacional nos permitió brindar tiempos de respuesta más rápidos para el mantenimiento y
			las reparaciones de los clientes, y nuestra área de despacho ha hecho que la entrega sean
			mucho más fáciles para todos.
		</p>
		<p>
			Somos un proveedor autorizado de ventas, servicios y repuestos para Can-Am, Indian Motorcycle,
			Polaris, Sea-Doo, Slingshot, Spyder, Suzuki, Triton Trailers, Victory Motorcycle y Yamaha.
		</p>
		<p>
			Nuestro amable y cortés personal de entusiastas de los deportes motorizados está disponible de
			lunes a viernes para brindarle asistencia con sus necesidades de deportes motorizados, ya sean
			vehículos todo terreno, motocicletas, PWC, scooters, side-x-sides. ropa, accesorios, piezas o
			servicio, estamos aquí para ayudar.
		</p>
		<h1>Llame o visítenos; ¡Estaras contento de haberlo hecho!</h1>
		<!--
		<a href="/" class="btn">read more</a>
		-->
	</div>
</section>

<section class="gallery">
	<h1 class="title">Nuestra <span>Galería</span> <a href="/">Ver todas >></a></h1>

	<div class="box-container">
		<div class="box">
			<img src="image/gallery/gallery-1.jpg" alt="" on:error={handleImgGalleryError} />
			<!--
			<div class="icons">
				<a href="/" class="fas fa-eye" />
				<a href="/" class="fas fa-heart" />
				<a href="/" class="fas fa-share-alt" />
			</div>
			-->
		</div>

		<div class="box">
			<img src="image/gallery/gallery-2.jpg" alt="" on:error={handleImgGalleryError} />
		</div>

		<div class="box">
			<img src="image/gallery/gallery-3.jpg" alt="" on:error={handleImgGalleryError} />
		</div>

		<div class="box">
			<img src="image/gallery/gallery-4.jpg" alt="" on:error={handleImgGalleryError} />
		</div>

		<div class="box">
			<img src="image/gallery/gallery-5.jpg" alt="" on:error={handleImgGalleryError} />
		</div>
	</div>
</section>

<!-- footer section starts  -->
<Footer />
