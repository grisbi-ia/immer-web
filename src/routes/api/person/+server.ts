import { secureApi } from '../api';

export async function PUT({ request, response }: { request: any, response: any }) {
    const body = await request.json();
    const responseFetch = await secureApi(body.token, 'PUT', `persons`, { body: body.person });
    const powerfinResponse = await responseFetch.json();
    return new Response(
        JSON.stringify(
            powerfinResponse
        ), { status: 200 })
}

