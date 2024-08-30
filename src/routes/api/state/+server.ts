import { secureApi } from '../api';
export async function POST({ request, response }: { request: any, response: any }) {
    const body = await request.json();
    const responseFetch = await secureApi(body.token, 'GET', `common/states?countryId=${body["countryId"]}`);
    const powerfinResponse = await responseFetch.json();
    return new Response(
        JSON.stringify(
            powerfinResponse
        ), { status: 200 })
}