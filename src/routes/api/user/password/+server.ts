import { secureApi } from '../../api';

export async function POST({ request, response }: { request: any, response: any }) {
    const body = await request.json();
    const responseFetch = await secureApi(body.token, 'POST', `external-users/immer/${body["id"]}/reset-password`, { body: body.password });
    const powerfinResponse = await responseFetch.json();
    return new Response(
        JSON.stringify(
            powerfinResponse
        ), { status: 200 })
}

export async function PUT({ request, response }: { request: any, response: any }) {
    const body = await request.json();
    const responseFetch = await secureApi(body.token, 'PUT', `external-users/immer/${body["id"]}/change-password`, { body: body.password });
    const powerfinResponse = await responseFetch.json();
    return new Response(
        JSON.stringify(
            powerfinResponse
        ), { status: 200 })
}
