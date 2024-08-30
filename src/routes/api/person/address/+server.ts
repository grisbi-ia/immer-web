import { secureApi } from '../../api';

export async function PUT({ request, response }: { request: any, response: any }) {
    const body = await request.json();
    const responseFetch = await secureApi(body.token, 'PUT', 'persons/address', { body: body.address });
    const powerfinResponse = await responseFetch.json();
    return new Response(
        JSON.stringify(
            powerfinResponse
        ), { status: 200 })
}

export async function POST({ request, response }: { request: any, response: any }) {
    const body = await request.json();
    const responseFetch = await secureApi(body.token, 'POST', 'persons/address', { body: body.address });
    const powerfinResponse = await responseFetch.json();
    return new Response(
        JSON.stringify(
            powerfinResponse
        ), { status: 200 })
}

export async function DELETE({ request, response }: { request: any, response: any }) {
    const body = await request.json();
    const responseFetch = await secureApi(body.token, 'DELETE', `persons/address/${body["id"]}`);
    const powerfinResponse = await responseFetch.json();
    return new Response(
        JSON.stringify(
            powerfinResponse
        ), { status: 200 })
}
