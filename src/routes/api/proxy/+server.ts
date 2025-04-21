import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const targetUrl = url.searchParams.get('url');
  
  if (!targetUrl) {
    return new Response('URL parameter is required', { status: 400 });
  }
  
  try {
    // Verificar que la URL es segura (solo permitimos immer.ec)
    const parsedUrl = new URL(targetUrl);
    if (parsedUrl.hostname !== 'immer.ec') {
      return new Response('Only immer.ec URLs are allowed', { status: 403 });
    }
    
    // Realizar la solicitud al recurso externo
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      return new Response(`Error fetching resource: ${response.statusText}`, {
        status: response.status
      });
    }
    
    // Obtener el tipo de contenido y los bytes del recurso
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const data = await response.arrayBuffer();
    
    // Crear una nueva respuesta con los datos y el tipo de contenido adecuado
    return new Response(data, {
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=86400',
        'access-control-allow-origin': '*'
      }
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response('Error fetching the resource', { status: 500 });
  }
};