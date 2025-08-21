/**
 * Utilidades para manejo simple de imágenes WebP únicamente
 * Sistema simplificado: WebP → product.webp como fallback
 */

/**
 * Obtiene la imagen WebP del producto o fallback a imagen por defecto
 */
export function getBestImageSource(productId: string, fallback: string = '/image/product.webp'): Promise<string> {
    // En SSR, devolver fallback directamente para evitar errores
    if (typeof window === 'undefined') {
        return Promise.resolve(fallback);
    }

    return new Promise((resolve) => {
        const img = new Image();
        const webpUrl = `/image/products/${productId}.webp`;

        img.onload = () => {
            // Si la imagen WebP se carga correctamente
            resolve(webpUrl);
        };

        img.onerror = () => {
            // Si falla, usar imagen por defecto
            resolve(fallback);
        };

        img.src = webpUrl;
    });
}