import type { Writable } from 'svelte/store';
import { writable, get, derived } from 'svelte/store';
import { browser } from "$app/env";

export const currentProduct: Writable<string> = writable(null);
export const currentPage: Writable<number> = writable(1);
export const totalPages: Writable<number> = writable(null);
export const textToSearch: Writable<string> = writable(null);
export const groupToSearch: Writable<string> = writable(null);

export const data: Writable<Product[]> = writable([]);

export const groups: Writable<Group[]> = writable([]);

export const identificationTypes: Writable<IdentificationType[]> = writable([]);

export const currentUser: Writable<CurrentUser> = writable(null);

//export const cartProducts: Writable<Product[]> = writable([]);

export const cartProducts: Writable<Product[]> = writable(getCartProductsLocalStorage());
cartProducts.subscribe((val) => {
    if (browser) return (localStorage.cart = JSON.stringify(val));
});

function getCartProductsLocalStorage() {
    if (browser) {
        const retrieved = localStorage.getItem('cart')
        const parsed = JSON.parse(retrieved);
        return parsed === null ? [] : parsed;
    }
    return [];
}

export const totalCart = derived(
    cartProducts,
    ($cartProducts) => {
        let price = 0
        $cartProducts.forEach(e => price = price + (e.newPrice * e.availibilityCount))
        return price
    }
);

export const totalCartNoLogged = derived(
    cartProducts,
    ($cartProducts) => {
        let price = 0
        $cartProducts.forEach(e => price = price + (e.oldPrice * e.availibilityCount))
        return price
    }
);

export const totalUnities = derived(
    cartProducts,
    ($cartProducts) => {
        let cant = 0
        $cartProducts.forEach(e => cant = cant + e.availibilityCount)
        return cant
    }
);

export const token: Writable<string> = writable(getTokenSessionStorage());
token.subscribe((val) => {
    if (browser) return (sessionStorage.token = val);
});

function getTokenSessionStorage() {
    if (browser) {
        return sessionStorage.getItem('token') ? sessionStorage.getItem('token') : null;
    }
    return null;
}

export function addProduct(product, quantity) {
    if (findProduct(product)) { // if item is in cart 

        let p = get(cartProducts).map(item =>
            item.id === product.id
                ? { ...item, availibilityCount: item.availibilityCount + quantity }
                : item
        );
        cartProducts.set(p);
    }
    else { // if item is not in cart
        let p = get(cartProducts);
        p = [...p, product];
        cartProducts.set(p);
    }
}

function findProduct(product: Product) {
    for (let item of get(cartProducts)) {
        if (item.id === product.id)
            return true;
    }
    return false;
}



