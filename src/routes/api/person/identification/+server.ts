import { api } from '../../api';

export async function GET({ request, response }: { request: any, response: any }) {
    const responseFetch = await api('GET', `common/identification-types`);
    const powerfinResponse = await responseFetch.json();
    return new Response(
        JSON.stringify(
            powerfinResponse
        ), { status: 200 })
}
