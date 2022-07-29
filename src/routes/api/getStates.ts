import { URL_API, API_KEY } from '$lib/Env';

export async function post({ request }: { request: Request; }): Promise<{ status: number; body: string; } | { status: number; }> {
    const body = await request.json();
    let api_url = `${URL_API}/common/states?countryId=${body["countryId"]}`;
    const response = await fetch(api_url, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': `${API_KEY}`
        },
        method: 'GET'
    });

    const resJson = await response.json();

    if (response.ok) {
        return {
            status: 200,
            body: JSON.stringify(resJson)
        }
    }
    return {
        status: 404
    }
}
