<script lang="ts">
  import { onMount } from 'svelte';
  
  export let src: string;
  export let alt: string = '';
  export let width: string = 'auto';
  export let height: string = 'auto';
  export let className: string = '';
  export let loading: string = 'lazy';
  export let onError: (e: Event) => void = () => {};
  
  let loaded = false;
  let error = false;
  let imgElement: HTMLImageElement;
  let defaultSrc = "/image/product.png"; // Ruta de la imagen por defecto
  
  // Handle image load
  function handleLoad() {
    loaded = true;
  }
  
  // Handle image error
  function handleError(event: Event) {
    error = true;
    loaded = true; // Considerar como cargada para quitar el placeholder
    onError(event);
  }
  
  onMount(() => {
    // Check if image is already in browser cache
    if (imgElement && imgElement.complete) {
      loaded = true;
      // Si la imagen está completa pero hubo un error, marca como error
      if (imgElement.naturalWidth === 0) {
        error = true;
      }
    }
  });
</script>

<div class="image-container" style="width: {width}; height: {height};">
  <!-- Show loading placeholder if not loaded -->
  {#if !loaded}
    <div class="image-placeholder"></div>
  {/if}
  
  <!-- Actual image -->
  <img
    bind:this={imgElement}
    src={src}
    {alt}
    loading={loading}
    decoding="async"
    class={`optimized-image ${className}`}
    on:load={handleLoad}
    on:error={handleError}
  />
</div>

<style>
  .image-container {
    position: relative;
    overflow: hidden;
    display: inline-block; /* Asegura que el contenedor tenga el tamaño correcto */
    min-height: 20px; /* Altura mínima para evitar colapso */
  }
  
  .image-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #f3f3f3;
    z-index: 1;
  }
  
  .optimized-image {
    position: relative;
    z-index: 2;
    opacity: 1; /* Siempre completamente visible */
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>