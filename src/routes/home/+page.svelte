<script>
	import Footer from "$lib/components/Footer.svelte";
	import Header from "$lib/components/Header.svelte";

	import { onMount } from "svelte";

	import { states, cities, districts } from "$lib/stores/store";

	onMount(async () => {
		const resStates = await fetch("/api/state", {
			method: "POST",
			body: JSON.stringify({
				countryId: "EC",
			}),
		});
		const res = await resStates.json();
		states.set(await res.objectList);

		const resCities = await (
			await fetch("/api/city", {
				method: "POST",
				body: JSON.stringify({
					countryId: "EC",
				}),
			})
		).json();
		cities.set(await resCities.objectList);

		const resDistricts = await (
			await fetch("/api/district", {
				method: "POST",
				body: JSON.stringify({
					countryId: "EC",
				}),
			})
		).json();
		districts.set(await resDistricts.objectList);
	});
	let Carousel; // for saving Carousel component class
	let carousel; // for calling methods of the carousel instance
	onMount(async () => {
		const module = await import("svelte-carousel");
		Carousel = module.default;
	});

	const handleNextClick = () => {
		carousel.goToNext();
	};

	const handleImgBannerError = (ev) => (ev.target.src = "image/banner.jpg");
	const handleImgSliderError = (ev) => (ev.target.src = "image/slider.jpg");
</script>

<Header />

<section class="home">
	<div class="slides-container">
		<svelte:component
			this={Carousel}
			autoplay
			autoplayProgressVisible
			pauseOnFocus
			bind:this={carousel}
		>
			<div class="slide active">
				<div class="content">
					<span
						>Importadores de Repuestos y Accesorios para su Moto
					</span>
					<h3>Envíos nacionales</h3>
					<a href="/shop" class="btn">Comprar Ahora</a>
				</div>
				<div class="image">
					<img
						src="image/slider/slider-1.png"
						alt=""
						on:error={handleImgSliderError}
					/>
				</div>
			</div>
			<div class="slide active">
				<div class="content">
					<span>Las mejores marcas nacionales e internacionales</span>
					<h3>Maxsro, Riffel, Vedamotors..</h3>
					<a href="/shop" class="btn">Comprar Ahora</a>
				</div>
				<div class="image">
					<img
						src="image/slider/slider-2.png"
						alt=""
						on:error={handleImgSliderError}
					/>
				</div>
			</div>
			<div class="slide active">
				<div class="content">
					<span
						>Precios especiales y descuentos en compras al por mayor</span
					>
					<h3>Descuentos del 25%</h3>
					<a href="/shop" class="btn">Comprar Ahora</a>
				</div>
				<div class="image">
					<img
						src="image/slider/slider-3.png"
						alt=""
						on:error={handleImgSliderError}
					/>
				</div>
			</div>
			<div class="slide active">
				<div class="content">
					<span
						>Asesoramos a nuestros Clientes siempre pensando en sus
						requerimientos técnicos</span
					>
					<h3>Asesoria personalizada</h3>
					<a href="/shop" class="btn">Comprar Ahora</a>
				</div>
				<div class="image">
					<img
						src="image/slider/slider-4.png"
						alt=""
						on:error={handleImgSliderError}
					/>
				</div>
			</div>
		</svelte:component>
	</div>
</section>

<section class="info-container">
	<div class="info">
		<img src="image/icon-1.png" alt="" />
		<div class="content">
			<h3>Envíos Nacionales</h3>
			<span>Envíos de pedidos a todas las ciudades de Ecuador</span>
		</div>
	</div>

	<div class="info">
		<img src="image/icon-2.png" alt="" />
		<div class="content">
			<h3>Horario de atención</h3>
			<span>Lunes a Viernes 8:30am - 17:00pm</span>
		</div>
	</div>

	<div class="info">
		<img src="image/icon-3.png" alt="" />
		<div class="content">
			<h3>Partes Originales</h3>
			<span>Altos estándares de calidad y resistencia.</span>
		</div>
	</div>
</section>

<section class="banner-container">
	<div class="banner">
		<img
			src="image/banner/banner-1.png"
			alt=""
			on:error={handleImgBannerError}
		/>
		<div class="content">
			<!--<span>Aceites</span>-->
			<h3>Aceites</h3>
			<a href="/shop" class="btn">Comprar ahora</a>
		</div>
	</div>

	<div class="banner">
		<img
			src="image/banner/banner-2.png"
			alt=""
			on:error={handleImgBannerError}
		/>
		<div class="content">
			<!--<span>Accesorios</span>-->
			<h3>Accesorios</h3>
			<a href="/shop" class="btn">Comprar ahora</a>
		</div>
	</div>

	<div class="banner">
		<img
			src="image/banner/banner-3.png"
			alt=""
			on:error={handleImgBannerError}
		/>
		<div class="content">
			<!--<span>Repuestos</span>-->
			<h3>Repuestos</h3>
			<a href="/shop" class="btn">Comprar ahora</a>
		</div>
	</div>

	<div class="banner">
		<img
			src="image/banner/banner-4.png"
			alt=""
			on:error={handleImgBannerError}
		/>
		<div class="content">
			<!--<span>Repuestos</span>-->
			<h3>Ropa</h3>
			<a href="/shop" class="btn">Comprar ahora</a>
		</div>
	</div>
</section>

<Footer />
