import { URL_API, API_KEY } from '$lib/Env';

export async function post({ request }: { request: Request; }): Promise<{ status: number; body: string; } | { status: number; }> {
    const body = await request.json();
    let api_url = `${URL_API}/external-users/immer/${body["userName"]}`
    const response = await fetch(api_url, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': `${API_KEY}`,
            'Authorization': `Bearer ${body["token"]}`
        },
        method: 'GET'
    });

    if (response.ok) {
        const data = await response.json();
        return {
            status: 200,
            body: JSON.stringify(data)
        }
    }
    return {
        status: 404
    }
}
