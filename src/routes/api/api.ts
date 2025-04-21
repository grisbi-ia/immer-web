import { VITE_API_KEY, VITE_URL_API, VITE_URL_GO_API } from '$env/static/private';
export function api(method: string, resource: string, data?: Record<string, unknown>) {
	return fetch(`${VITE_URL_API}/${resource}`, {
		method,
		headers: {
			'content-type': 'application/json',
			'x-api-key': `${VITE_API_KEY}`
		},
		body: data && JSON.stringify(data.body)
	});
}

export function secureApi(token: string, method: string, resource: string, data?: Record<string, unknown>) {
	return fetch(`${VITE_URL_API}/${resource}`, {
		method,
		headers: {
			'content-type': 'application/json',
			'x-api-key': `${VITE_API_KEY}`,
			'Authorization': `Bearer ${token}`
		},
		body: data && JSON.stringify(data.body)
	});
}

export function goApi(method: string, resource: string, data?: Record<string, unknown>) {
	console.log("Api Resource:" + `${VITE_URL_GO_API}/${resource}`);
	return fetch(`${VITE_URL_GO_API}/${resource}`, {
		method,
		headers: {
			'content-type': 'application/json',
			'x-api-key': `${VITE_API_KEY}`
		},
		body: data && JSON.stringify(data.body)
	});
}

export function goSecureApi(token: string, method: string, resource: string, data?: Record<string, unknown>) {
	return fetch(`${VITE_URL_GO_API}/${resource}`, {
		method,
		headers: {
			'content-type': 'application/json',
			'x-api-key': `${VITE_API_KEY}`,
			'Authorization': `Bearer ${token}`
		},
		body: data && JSON.stringify(data.body)
	});
}