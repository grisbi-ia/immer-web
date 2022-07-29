import { URL_API, API_KEY } from '$lib/Env';
//import { variables.URL_API } from '$lib/variables';

export async function post({ request }: { request: Request; }): Promise<{ status: number; body: string; } | { status: number; }> {
    const body = await request.json();
    let api_url = `${URL_API}/items/immer/pos/POS001?inStock=true&p=${body["page"]}`

    if (body.textToSearch) {
        api_url = `${URL_API}/items/immer/pos/POS001?inStock=true&p=${body["page"]}&name=${body["textToSearch"]}`
    }
    else if (body.groupToSearch) {
        api_url = `${URL_API}/items/immer/pos/POS001?inStock=true&p=${body["page"]}&group=${body["groupToSearch"]}`
    }
    else if (body.id) {
        api_url = `${URL_API}/items/immer/pos/POS001?inStock=true&p=${body["page"]}&id=${body["id"]}`
    }
    else {
        api_url = `${URL_API}/items/immer/pos/POS001?inStock=true&p=${body["page"]}`
    }
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
