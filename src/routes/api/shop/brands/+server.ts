import { goApi } from '../../api';

export async function GET() {
    try {
        const responseFetch = await goApi('GET', 'brands');
        const powerfinResponse = await responseFetch.json();

        return new Response(
            JSON.stringify(powerfinResponse),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('Error fetching brands:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to fetch brands',
                objectList: []
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}
