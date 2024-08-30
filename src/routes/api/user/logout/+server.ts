
import { api } from '../../api';

export async function POST({ request, response }: { request: any, response: any }) {
    const body = await request.json();
    const responseFetch = await api('POST', 'external-users/logout', { body });
    const powerfinResponse = await responseFetch.json();
    return new Response(
        JSON.stringify(
            powerfinResponse
        ), { status: 200 })
}