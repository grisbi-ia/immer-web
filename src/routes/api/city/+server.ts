import { secureApi, goSecureApi } from '../api';

export async function POST({ request, response }: { request: any, response: any }) {
    const body = await request.json();
    const responseFetch = await secureApi(body.token, 'GET', `common/cities?countryId=${body["countryId"]}`);
    const powerfinResponse = await responseFetch.json();
    //console.log(powerfinResponse)
    return new Response(
        JSON.stringify(
            powerfinResponse
        ), { status: 200 })
}

export async function POSTNEW({ request, response }: { request: any, response: any }) {
    const body = await request.json();
    const responseFetch = await goSecureApi(body.token, 'GET', `cities?countryId=${body["countryId"]}`);
    const powerfinResponse = await responseFetch.json();
    //console.log(powerfinResponse)
    return new Response(
        JSON.stringify(
            powerfinResponse
        ), { status: 200 })
}