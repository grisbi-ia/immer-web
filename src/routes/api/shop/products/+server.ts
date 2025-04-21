import { api, goApi } from '../../api';

export async function POST({ request, response }: { request: any, response: any }) {
    const body = await request.json();
    let discount = body["discount"];
    let priceList = body["priceList"];

    if (!discount)
        discount = 0;

    if (priceList === "null")
        priceList = ""

    let resource = '';
    let limit = 20;

    if (body.textToSearch) {
        resource = `items/pos/POS001?priceList=${priceList}&discount=${discount}&l=${limit}&p=${body["page"]}&name=${body["textToSearch"]}`
    }
    else if (body.groupToSearch) {
        resource = `items/pos/POS001?priceList=${priceList}&discount=${discount}&l=${limit}&p=${body["page"]}&group=${body["groupToSearch"]}`
    }
    else if (body.id) {
        resource = `items/pos/POS001?priceList=${priceList}&discount=${discount}&l=${limit}&p=${body["page"]}&id=${body["id"]}`
    }
    else {
        resource = `items/pos/POS001?priceList=${priceList}&discount=${discount}&l=${limit}&p=${body["page"]}`
    }

    console.log("Resource:" + `${resource}`);

    const responseFetch = await goApi('GET', `${resource}`);
    const powerfinResponse = await responseFetch.json();
    return new Response(
        JSON.stringify(
            powerfinResponse
        ), { status: 200 })
}
