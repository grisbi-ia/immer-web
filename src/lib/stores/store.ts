import type { Writable } from 'svelte/store';
import { writable, get, derived } from 'svelte/store';
import { browser } from "$app/environment";


export const selectedValue1: Writable<string> = writable('');

export const loading: Writable<boolean> = writable(false);
export const message: Writable<string> = writable('');
export const currentPage: Writable<number> = writable(1);
export const totalPages: Writable<number> = writable(0);
export const totalRecords: Writable<number> = writable(0);
export const totalRecordsRequest: Writable<number> = writable(0);
export const textToSearch: Writable<string | null> = writable(null);
export const groupToSearch: Writable<string | null> = writable(null);
export const currentGroupName: Writable<string | null> = writable(null);

export const data: Writable<Product[]> = writable([]);

export const groups: Writable<Group[]> = writable([]);
export const subgroups: Writable<Group[]> = writable([]);

export const states: Writable<State[]> = writable([]);
export const cities: Writable<City[]> = writable([]);
export const districts: Writable<District[]> = writable([]);

export const identificationTypes: Writable<IdentificationType[]> = writable([]);

export const currentUser: Writable<CurrentUser | null> = writable();

export const cartProducts: Writable<Product[]> = writable(getCartProductsLocalStorage());
cartProducts.subscribe((val) => {
    if (browser) return (localStorage.cart = JSON.stringify(val));
});

function getCartProductsLocalStorage() {
    if (browser) {
        const retrieved: string | null = localStorage.getItem('cart')
        const parsed = JSON.parse(retrieved);
        return parsed === null ? [] : parsed;
    }
    return [];
}

export const totalCart = derived(
    cartProducts,
    ($cartProducts) => {
        let price = 0
        $cartProducts.forEach(e => price = price + (e.newPrice * e.availibilityCountInCart))
        return price
    }
);

export const totalCartNoLogged = derived(
    cartProducts,
    ($cartProducts) => {
        let price = 0
        $cartProducts.forEach(e => price = price + (e.oldPrice * e.availibilityCountInCart))
        return price
    }
);

export const totalUnities = derived(
    cartProducts,
    ($cartProducts) => {
        let cant = 0
        $cartProducts.forEach(e => cant = cant + e.availibilityCountInCart)
        return cant
    }
);

export const token: Writable<string | null> = writable(getTokenSessionStorage());
token.subscribe((val) => {
    if (browser) return (sessionStorage.token = val);
});

function getTokenSessionStorage() {
    if (browser) {
        return sessionStorage.getItem('token') ? sessionStorage.getItem('token') : null;
    }
    return null;
}

function getPrice(price: number, discount: number) {
    if (discount > 0) {
        const a = price * (discount / 100);
        const b = price - a;
        return Math.round(b * 100) / 100;
    } else return price;
}

export function addProduct(product: Product, quantity: number) {
    let objIndex = getIndexProductInCart(product);
    let finalQuantity = 0;
    if (objIndex > -1) { // if item is in cart 
        get(cartProducts)[objIndex].availibilityCountInCart = get(cartProducts)[objIndex].availibilityCountInCart + quantity;
        return get(cartProducts)[objIndex].availibilityCountInCart;
    }
    else { // if item is not in cart
        let p = get(cartProducts);
        const newProduct = Object.assign({}, product);
        newProduct.availibilityCountInCart = quantity;
        newProduct.newPrice = getPrice(newProduct.newPrice, get(currentUser).person.discountRate);
        p = [...p, newProduct];
        cartProducts.set(p);
        return newProduct.availibilityCountInCart;
    }
}

function isProductInCart(product: Product) {
    for (let item of get(cartProducts)) {
        if (item.id === product.id)
            return true;
    }
    return false;
}

export function getIndexProductInCart(product: Product) {
    let objIndex = get(cartProducts).findIndex((obj) => obj.id == product.id);
    return objIndex;
}
export function getProductInCart(product: Product) {
    for (let item of get(cartProducts)) {
        if (item.id === product.id) {
            return item;
        }
    }
    return undefined;
}

export const pf_lp: Writable<string | null> = writable(getLPSessionStorage());
pf_lp.subscribe((val) => {
    if (browser) return (sessionStorage.pf_lp = val);
});

function getLPSessionStorage() {
    if (browser) {
        return sessionStorage.getItem('pf_lp') ? sessionStorage.getItem('pf_lp') : null;
    }
    return null;
}
