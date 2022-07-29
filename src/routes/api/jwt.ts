
import { token } from '$lib/stores/store';
import { get } from 'svelte/store';

export function isValidToken() {
    let result = false;
    if (get(token)) {
        try {
            var base64Url = get(token).split('.')[1];
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
        var base64Url = get(token).split('.')[1];
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

