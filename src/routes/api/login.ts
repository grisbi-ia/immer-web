import { URL_API, API_KEY } from '$lib/Env';

export async function post({ request }: { request: Request; }): Promise<{ status: number; body: string; message: string } | { status: number; message: string; }> {
    const body = await request.json();
    const api_url = `${URL_API}/external-users/immer/login`
    const response = await fetch(api_url, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': `${API_KEY}`
        },
        body: JSON.stringify({ username: body.username, password: body.password }),
        method: 'POST'
    });

    const resJson = await response.json();
    return {
        status: resJson.status,
        message: resJson.message,
        body: JSON.stringify(resJson)
    }

}
