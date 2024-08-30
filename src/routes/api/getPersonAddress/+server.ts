import { URL_API, API_KEY } from '$lib/Env';

export async function POST(): Promise<{ status: number; body: string; } | { status: number; }> {
    let api_url = `${URL_API}/persons/{id}/address`;
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
            body: JSON.stringify({ resJson })
        }
    }
    return {
        status: 404
    }
}
