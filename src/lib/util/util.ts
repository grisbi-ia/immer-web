import { toasts } from 'svelte-toasts';
import {
    currentUser,
    data,
    currentPage,
    textToSearch,
    totalPages,
    groupToSearch,
    token,
    loading,
    message,
    totalRecords,
    totalRecordsRequest,
    pf_lp,
} from "$lib/stores/store";
import { get } from 'svelte/store';
import type { ToastType } from 'svelte-toasts/types/common';

export const showAlert = (type: ToastType, title: string, message: string) => {
    const toast = toasts.add({
        title: title,
        description: message,
        duration: 2000,
        placement: 'top-center',
        type: type,
        theme: 'dark',
        showProgress: true,
        onClick: () => { },
        onRemove: () => { }
    });
};

export function isValidToken() {
    let result = false;
    if (get(token)) {
        try {
            var base64Url = get(token)?.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const data = JSON.parse(jsonPayload);
            if (data.iat && data.sub && data.iss)
                result = true;
        }
        catch (e) {
            result = false;
        }
    }
    if (!result)
        token.set(null);

    return result;
}

export function getUserFromToken() {
    if (isValidToken()) {
        var base64Url = get(token)?.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const data = JSON.parse(jsonPayload);

        return data.sub
    }
    else {
        return null;
    }
}

export async function searchProducts(moreData: boolean) {
    loading.set(true)
    message.set('')
    let discount = 0;
    let priceList = decryptLP(get(pf_lp) ?? "");
    const user = get(currentUser);

    if (user && user.person.discountRate > 0) {
        discount = user.person.discountRate;
    }

    if (!moreData) {
        currentPage.set(1);
        totalPages.set(0);
        data.set([]);
    }

    const responseFetch = await fetch("/api/shop/products", {
        method: "POST",
        body: JSON.stringify({
            page: get(currentPage),
            textToSearch: get(textToSearch),
            groupToSearch: get(groupToSearch),
            discount: discount,
            priceList: priceList
        }),
    });
    const responseProduct = await responseFetch.json();
    if (moreData) {
        const newData = await responseProduct.objectList;
        data.set([...get(data), ...newData]);
    }
    else {
        data.set(await responseProduct.objectList);
    }
    totalPages.set(await responseProduct.lastPage);
    totalRecords.set(await responseProduct.totalRecords)
    totalRecordsRequest.set(await responseProduct.totalRecordsRequest)
    loading.set(false);
    message.set(responseProduct.message)

}

export async function login(credentials: Credentials) {
    const responseFetchLogin = await fetch("/api/user/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });
    const responseLogin = await responseFetchLogin.json();
    if (responseLogin.status === "200") {
        const tokenResponse = await responseLogin.token;
        if (tokenResponse) {
            token.set(tokenResponse);
            credentials.token = tokenResponse;
            const responseU = await fetch('../api/user', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            if (responseU.ok) {
                const responseUJson = await responseU.json();
                const u = await responseUJson.objectList[0];
                currentUser.set(u);
                let priceList = encryptLP(u.person.priceListId ?? "");
                pf_lp.set(priceList);
                return 'OK';
            }
        } else {
            return 'Token not found.';
        }
    }
    else
        return responseLogin.message;
}

export async function reloadUserFromToken() {

    const credentials: Credentials = {
        username: getUserFromToken(),
        password: '',
        token: get(token)
    }
    const responseU = await fetch('../api/user', {
        method: 'POST',
        body: JSON.stringify(credentials)
    });

    if (responseU.ok) {
        const responseUJson = await responseU.json();
        const u = await responseUJson.objectList[0];
        currentUser.set(u);
        let priceList = encryptLP(u.person.priceListId ?? "");
        pf_lp.set(priceList);
    }

}

function encryptLP(lp: string) {
    return generateRandomString(10) + lp;
}
function decryptLP(encryptLP: string) {
    return encryptLP.substring(encryptLP.length - 1)
}

function generateRandomString(length: number): string {
    let result = '';
    const characters: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersArray = characters.split('');

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersArray.length);
        result += charactersArray[randomIndex];
    }
    return result;
}