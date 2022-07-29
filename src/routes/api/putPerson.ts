import { URL_API, API_KEY } from '$lib/Env';

export async function put({ request }: { request: Request; }): Promise<{ status: number; body: string; message: string; } | { status: number; message: string; }> {
    const body = await request.json();
    const api_url = `${URL_API}/persons`;
    const response = await fetch(api_url, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': `${API_KEY}`,
            'Authorization': `Bearer ${body["token"]}`
        },
        body: JSON.stringify(body.personBean),
        method: 'PUT'
    });

    const resJson = await response.json();
    return {
        status: resJson.status,
        body: JSON.stringify(resJson),
        message: resJson.message,
    }


}
