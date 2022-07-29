import { URL_API, API_KEY } from '$lib/Env';

export async function post({ request }: { request: Request; }): Promise<{ status: number; body: string; } | { status: number; }> {
    const body = await request.json();
    const api_url = `${URL_API}/external-users/logout`
    const response = await fetch(api_url, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': `${API_KEY}`
        },
        body: JSON.stringify({ username: body.username }),
        method: 'POST'
    });

    const resJson = await response.json();
    return {
        status: 200,
        body: JSON.stringify({ resJson })
    }
}
