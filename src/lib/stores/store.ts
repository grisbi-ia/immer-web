import type { Writable } from 'svelte/store';
import { writable, get, derived } from 'svelte/store';
import { browser } from "$app/environment";

// 🆕 NAVEGACIÓN PERSISTENTE - Tipos para estado persistente
export type FilterState = {
    textToSearch: string | null;
    selectedBrand: CatalogBrand | null;
    selectedGroup: CatalogGroup | null;
    selectedSubgroup: CatalogSubgroup | null;
    currentPage: number;
    totalProducts: number;
    scrollPosition: number;
    timestamp: number;
}


export const selectedValue1: Writable<string> = writable('');

export const loading: Writable<boolean> = writable(false);
export const message: Writable<string> = writable('');
export const currentPage: Writable<number> = writable(1);
export const totalPages: Writable<number> = writable(0);
export const totalRecords: Writable<number> = writable(0);
export const totalRecordsRequest: Writable<number> = writable(0);
export const textToSearch: Writable<string | null> = writable(null);

// 🆕 NAVEGACIÓN PERSISTENTE - Estado de catálogo
export const products: Writable<Product[]> = writable([]);
export const hasMoreProducts: Writable<boolean> = writable(true);
export const catalogScrollPosition: Writable<number> = writable(0);
export const lastAppliedFilters: Writable<FilterState | null> = writable(getLastFiltersFromStorage());

// 🆕 NAVEGACIÓN PERSISTENTE - Funciones de persistencia
function getLastFiltersFromStorage(): FilterState | null {
    if (browser) {
        try {
            const stored = localStorage.getItem('lastCatalogFilters');
            if (stored) {
                const parsed = JSON.parse(stored);
                console.log("📥 Loading filters from storage:", {
                    textToSearch: parsed.textToSearch,
                    brand: parsed.selectedBrand?.name || 'null',
                    group: parsed.selectedGroup?.name || 'null',
                    subgroup: parsed.selectedSubgroup?.name || 'null',
                    page: parsed.currentPage,
                    totalProducts: parsed.totalProducts,
                    timestamp: parsed.timestamp ? new Date(parsed.timestamp).toISOString() : 'no timestamp'
                });
                return parsed;
            }
        } catch (error) {
            console.error("❌ Error loading filters from storage:", error);
            localStorage.removeItem('lastCatalogFilters'); // Remove corrupt data
        }
    }
    return null;
}

// Suscribirse a cambios de filtros para persistir automáticamente
let isRestoring = false;

function persistFiltersToStorage() {
    if (browser && !isRestoring) {
        try {
            const currentProducts = get(products) || [];
            const currentTextToSearch = get(textToSearch);
            const currentSelectedBrand = get(selectedBrand);
            const currentSelectedGroup = get(selectedGroup);
            const currentSelectedSubgroup = get(selectedSubgroup);
            const currentPageValue = get(currentPage);
            const currentScrollPosition = get(catalogScrollPosition);

            const currentFilters: FilterState = {
                textToSearch: currentTextToSearch,
                selectedBrand: currentSelectedBrand,
                selectedGroup: currentSelectedGroup,
                selectedSubgroup: currentSelectedSubgroup,
                currentPage: currentPageValue,
                totalProducts: currentProducts.length,
                scrollPosition: currentScrollPosition,
                timestamp: Date.now()
            };

            // Guardar en localStorage
            localStorage.setItem('lastCatalogFilters', JSON.stringify(currentFilters));

            // Actualizar store
            lastAppliedFilters.set(currentFilters);

            console.log("💾 Filters persisted to storage:", {
                textToSearch: currentTextToSearch,
                brand: currentSelectedBrand?.name || 'null',
                group: currentSelectedGroup?.name || 'null',
                subgroup: currentSelectedSubgroup?.name || 'null',
                page: currentPageValue,
                totalProducts: currentProducts.length,
                timestamp: new Date(currentFilters.timestamp).toISOString()
            });
        } catch (error) {
            console.error("❌ Error persisting filters to storage:", error);
        }
    }
}

// Función para permitir restauración sin disparar persistencia
export function setRestoringMode(restoring: boolean) {
    isRestoring = restoring;
}

// Catalog Relations (new system)
export const catalogData: Writable<CatalogData | null> = writable(null);

// Selected filters
export const selectedBrand: Writable<CatalogBrand | null> = writable(null);
export const selectedGroup: Writable<CatalogGroup | null> = writable(null);
export const selectedSubgroup: Writable<CatalogSubgroup | null> = writable(null);

// Available options (filtered)
export const availableBrands: Writable<CatalogBrand[]> = writable([]);
export const availableGroups: Writable<CatalogGroup[]> = writable([]);
export const availableSubgroups: Writable<CatalogSubgroup[]> = writable([]);

// Loading states
export const catalogLoading: Writable<boolean> = writable(false);

export const data: Writable<Product[]> = writable([]);

export const brands: Writable<Brand[]> = writable([]);

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
        if (retrieved) {
            const parsed = JSON.parse(retrieved);
            return parsed === null ? [] : parsed;
        }
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
        const currentUserValue = get(currentUser);
        if (currentUserValue?.person?.discountRate) {
            newProduct.newPrice = getPrice(newProduct.newPrice, currentUserValue.person.discountRate);
        }
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

// 🆕 NAVEGACIÓN PERSISTENTE - Auto-persistir filtros cuando cambien (al final del archivo)
if (browser) {
    // Debounced persistence para evitar llamadas excesivas
    let persistenceTimeout: NodeJS.Timeout | null = null;

    function debouncedPersist() {
        if (persistenceTimeout) {
            clearTimeout(persistenceTimeout);
        }
        persistenceTimeout = setTimeout(() => {
            persistFiltersToStorage();
        }, 300); // 300ms debounce
    }

    // Subscribe to filter changes
    textToSearch.subscribe((value) => {
        console.log("🔄 textToSearch changed:", value);
        debouncedPersist();
    });

    selectedBrand.subscribe((value) => {
        console.log("🔄 selectedBrand changed:", value?.name || 'null');
        debouncedPersist();
    });

    selectedGroup.subscribe((value) => {
        console.log("🔄 selectedGroup changed:", value?.name || 'null');
        debouncedPersist();
    });

    selectedSubgroup.subscribe((value) => {
        console.log("🔄 selectedSubgroup changed:", value?.name || 'null');
        debouncedPersist();
    });

    currentPage.subscribe((value) => {
        console.log("🔄 currentPage changed:", value);
        debouncedPersist();
    });

    catalogScrollPosition.subscribe((value) => {
        // Solo persistir scroll si es significativo
        if (value > 100) {
            debouncedPersist();
        }
    });

    console.log("✅ Filter persistence subscribers initialized");
}

// 🆕 NAVEGACIÓN PERSISTENTE - Función para persistir inmediatamente (sin debounce)
export function persistFiltersImmediately() {
    if (browser && !isRestoring) {
        console.log("💾 Immediate persistence requested");
        persistFiltersToStorage();
    }
}
