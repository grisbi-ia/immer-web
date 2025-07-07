import { toasts } from 'svelte-toasts';
import {
    currentUser,
    data,
    currentPage,
    textToSearch,
    totalPages,
    // New catalog filters
    selectedBrand,
    selectedGroup,
    selectedSubgroup,
    brands,
    availableGroups,
    availableSubgroups,
    catalogData,
    catalogLoading,
    // 🆕 NAVEGACIÓN PERSISTENTE
    products,
    hasMoreProducts,
    catalogScrollPosition,
    lastAppliedFilters,
    setRestoringMode,
    persistFiltersImmediately, // 🆕 Importar nueva función
    token,
    loading,
    message,
    totalRecords,
    totalRecordsRequest,
    pf_lp,
} from "$lib/stores/store";
import { get } from 'svelte/store';
import type { ToastType } from 'svelte-toasts/types/common';
import {
    CatalogRelations,
    catalogRelations,
} from "$lib/utils/catalog-relations";

// 🆕 NAVEGACIÓN PERSISTENTE - Flag para evitar restauraciones concurrentes
let isRestoring = false;

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
            if (base64Url) {
                var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const data = JSON.parse(jsonPayload);
                if (data.iat && data.sub && data.iss)
                    result = true;
            }
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
        if (base64Url) {
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const data = JSON.parse(jsonPayload);

            return data.sub
        }
    }
    return null;
}

export async function searchProducts(moreData: boolean) {
    // 🆕 NAVEGACIÓN PERSISTENTE - Llamar a nueva función mejorada
    return await searchProductsPersistent(moreData, false);
}

// 🆕 NAVEGACIÓN PERSISTENTE - Nueva función principal de búsqueda
export async function searchProductsPersistent(
    moreData: boolean,
    restoreFromCache: boolean = false
) {
    loading.set(true);
    message.set('');

    // Debug inicial
    // debugAppState(`searchProductsPersistent start - moreData:${moreData}, restore:${restoreFromCache}`);

    let discount = 0;
    let priceList = decryptLP(get(pf_lp) ?? "");
    const user = get(currentUser);

    if (user && user.person.discountRate > 0) {
        discount = user.person.discountRate;
    }

    // Si no es cargar más datos, preparar nueva búsqueda
    if (!moreData && !restoreFromCache) {
        console.log("🔄 RESETTING currentPage to 1 - Stack trace:");
        console.trace("Called from:");
        currentPage.set(1);
        totalPages.set(0);
        products.set([]);
        catalogScrollPosition.set(0);
        hasMoreProducts.set(true);
    }

    console.log("searchProductsPersistent called with:", {
        page: get(currentPage),
        moreData,
        restoreFromCache,
        textToSearch: get(textToSearch),
        selectedBrand: get(selectedBrand)?.name,
        selectedGroup: get(selectedGroup)?.name,
        selectedSubgroup: get(selectedSubgroup)?.name,
        currentProductsLength: get(products).length
    });

    let formatedTextToSearch = get(textToSearch);
    if (formatedTextToSearch != null) {
        formatedTextToSearch = formatedTextToSearch!.replaceAll("%", "%25");
    } else {
        formatedTextToSearch = "";
    }

    // Use new catalog filter system
    const currentSelectedBrand = get(selectedBrand);
    const currentSelectedGroup = get(selectedGroup);
    const currentSelectedSubgroup = get(selectedSubgroup);

    const activeBrandId = currentSelectedBrand?.id;
    // 🔄 CAMBIO URGENTE: Subgrupo se envía como "group" al API
    const activeGroupId = currentSelectedSubgroup?.id; // Ahora usa subgrupo
    const activeSubgroupId = currentSelectedSubgroup?.id;

    try {
        const responseFetch = await fetch("/api/shop/products", {
            method: "POST",
            body: JSON.stringify({
                page: get(currentPage),
                textToSearch: formatedTextToSearch,
                groupToSearch: activeGroupId, // 🔄 Ahora envía el ID del subgrupo seleccionado
                brandToSearch: activeBrandId,
                subgroupToSearch: activeSubgroupId,
                discount: discount,
                priceList: priceList
            }),
        });

        // Verificar que la respuesta sea exitosa
        if (!responseFetch.ok) {
            throw new Error(`HTTP error! status: ${responseFetch.status}`);
        }

        const responseProduct = await responseFetch.json();

        // Verificar que la respuesta tenga la estructura esperada
        if (!responseProduct || typeof responseProduct !== 'object') {
            throw new Error("Invalid API response format");
        }

        const newProducts = responseProduct.objectList || [];

        // Validar que newProducts sea un array
        if (!Array.isArray(newProducts)) {
            console.warn("API returned invalid products array:", newProducts);
            message.set("Error: formato de respuesta inválido");
            hasMoreProducts.set(false);
            return;
        }

        if (moreData) {
            // Agregar nuevos productos a la lista existente
            const currentProducts = get(products);
            products.set([...currentProducts, ...newProducts]);
            data.set(get(products)); // Mantener compatibilidad con data store
        } else {
            // Nueva búsqueda o restaurar caché
            products.set(newProducts);
            data.set(newProducts); // Mantener compatibilidad con data store
        }

        totalPages.set(await responseProduct.lastPage || 1);
        totalRecords.set(await responseProduct.totalRecords || 0);
        totalRecordsRequest.set(await responseProduct.totalRecordsRequest || 0);

        // Actualizar si hay más productos disponibles
        const currentPageNum = get(currentPage);
        const totalPagesNum = await responseProduct.lastPage || 1;
        hasMoreProducts.set(currentPageNum < totalPagesNum);

        message.set(responseProduct.message || "Productos cargados");

        console.log(`Loaded ${newProducts.length} products, total: ${get(products).length}`);

        // 🆕 NAVEGACIÓN PERSISTENTE - Persistir estado después de búsqueda exitosa
        if (!restoreFromCache) {
            setTimeout(() => {
                persistFiltersImmediately();
                console.log("💾 State persisted after successful search");
            }, 500);
        }

        // Debug final
        // debugAppState(`searchProductsPersistent success - loaded ${newProducts.length} products`);

    } catch (error) {
        console.error("Error in searchProductsPersistent:", error);

        // Debug del error
        // debugAppState("searchProductsPersistent error");

        console.error("Current state:", {
            page: get(currentPage),
            textToSearch: get(textToSearch),
            selectedBrand: get(selectedBrand)?.name,
            selectedGroup: get(selectedGroup)?.name,
            selectedSubgroup: get(selectedSubgroup)?.name,
            moreData,
            restoreFromCache
        });

        message.set("Error al cargar productos");
        hasMoreProducts.set(false);

        // En caso de error, asegurar que hay datos mínimos
        if (get(products).length === 0) {
            products.set([]);
            data.set([]);
        }
    } finally {
        loading.set(false);
    }
}

// 🆕 NAVEGACIÓN PERSISTENTE - Función para restaurar estado previo
export async function restoreCatalogState(): Promise<boolean> {
    // Prevenir llamadas concurrentes
    if (isRestoring) {
        console.log("⚠️ restoreCatalogState already in progress, skipping");
        return false;
    }

    isRestoring = true;

    try {
        // 🔧 CORREGIDO: Primero intentar leer desde localStorage directamente
        let savedFilters = get(lastAppliedFilters);

        if (!savedFilters) {
            console.log("📥 No filters in store, trying localStorage directly...");
            const storedString = localStorage.getItem('lastCatalogFilters');
            if (storedString) {
                try {
                    savedFilters = JSON.parse(storedString);
                    lastAppliedFilters.set(savedFilters);
                    console.log("📥 Loaded filters from localStorage:", savedFilters);
                } catch (error) {
                    console.error("❌ Error parsing localStorage filters:", error);
                    localStorage.removeItem('lastCatalogFilters');
                    return false;
                }
            }
        }

        if (!savedFilters) {
            console.log("❌ No saved catalog state found");
            return false;
        }

        // Verificar que el estado guardado no sea muy antiguo (5 minutos)
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        if (savedFilters.timestamp < fiveMinutesAgo) {
            console.log("⏰ Saved catalog state is too old, clearing");
            localStorage.removeItem('lastCatalogFilters');
            lastAppliedFilters.set(null);
            return false;
        }

        console.log("🔄 Restoring catalog state:", {
            textSearch: savedFilters.textToSearch,
            brand: savedFilters.selectedBrand?.name || 'null',
            group: savedFilters.selectedGroup?.name || 'null',
            subgroup: savedFilters.selectedSubgroup?.name || 'null',
            targetPage: savedFilters.currentPage,
            totalProducts: savedFilters.totalProducts,
            currentPageBefore: get(currentPage),
            timestamp: new Date(savedFilters.timestamp).toISOString()
        });

        // Activar modo de restauración para evitar auto-persistencia durante restore
        setRestoringMode(true);

        // Limpiar estado actual
        products.set([]);
        hasMoreProducts.set(true);

        // Restaurar filtros PRIMERO - esto es crítico
        if (savedFilters.textToSearch !== get(textToSearch)) {
            textToSearch.set(savedFilters.textToSearch);
        }
        if (savedFilters.selectedBrand !== get(selectedBrand)) {
            selectedBrand.set(savedFilters.selectedBrand);
        }
        if (savedFilters.selectedGroup !== get(selectedGroup)) {
            selectedGroup.set(savedFilters.selectedGroup);
        }
        if (savedFilters.selectedSubgroup !== get(selectedSubgroup)) {
            selectedSubgroup.set(savedFilters.selectedSubgroup);
        }

        // Desactivar modo de restauración
        setRestoringMode(false);

        // Pequeña pausa para que los filtros se apliquen
        await new Promise(resolve => setTimeout(resolve, 100));

        // Establecer página inicial y cargar la primera página
        currentPage.set(1);
        await searchProductsPersistent(false, true);        // Cargar páginas adicionales secuencialmente hasta la página objetivo
        const targetPage = savedFilters.currentPage;
        if (targetPage > 1) {
            console.log(`Loading additional pages from 2 to ${targetPage}...`);
            for (let page = 2; page <= targetPage; page++) {
                try {
                    currentPage.set(page);
                    await searchProductsPersistent(true, true);
                    console.log(`Loaded page ${page}, total products: ${get(products).length}`);

                    // Verificar que se cargaron productos
                    if (get(products).length === 0 && page === 2) {
                        console.warn("No products loaded on page 2, stopping sequential load");
                        break;
                    }

                    // Pequeña pausa entre páginas para evitar sobrecarga
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch (pageError) {
                    console.error(`Error loading page ${page}:`, pageError);
                    // Continuar con la siguiente página en lugar de fallar completamente
                    continue;
                }
            }
        }

        // ✅ CORRECCION: Asegurar que currentPage quede en la página objetivo
        console.log(`Final currentPage setting: ${targetPage} (was: ${get(currentPage)})`);
        currentPage.set(targetPage);

        // Restaurar posición de scroll después de que se hayan cargado los productos
        setTimeout(() => {
            if (savedFilters.scrollPosition > 0) {
                window.scrollTo({
                    top: savedFilters.scrollPosition,
                    behavior: 'smooth'
                });
                console.log("Scroll position restored to:", savedFilters.scrollPosition);
            }
        }, 1000);

        console.log(`✅ State restored successfully: page ${targetPage}, ${get(products).length} products loaded`);

        // Debug final del estado de paginación
        // debugAppState("restoreCatalogState completed");
        console.log("Final pagination state:", {
            currentPage: get(currentPage),
            totalPages: get(totalPages),
            targetPageWas: targetPage,
            hasMoreProducts: get(hasMoreProducts),
            totalProducts: get(products).length
        });

        return true;

    } catch (error) {
        console.error("❌ Error restoring catalog state:", error);
        // En caso de error, hacer búsqueda normal
        await searchProductsPersistent(false);
        return false;
    } finally {
        // Liberar el flag de restauración
        isRestoring = false;
    }
}

// 🆕 NAVEGACIÓN PERSISTENTE - Función para limpiar estado guardado
export function clearCatalogState() {
    localStorage.removeItem('lastCatalogFilters');
    lastAppliedFilters.set(null);
    catalogScrollPosition.set(0);
}

// 🆕 NAVEGACIÓN PERSISTENTE - Función para guardar posición de scroll
export function saveCatalogScrollPosition() {
    const scrollY = window.scrollY;
    catalogScrollPosition.set(scrollY);
}

// 🆕 NAVEGACIÓN PERSISTENTE - Función para detectar regreso desde páginas específicas
export function shouldRestoreCatalogState(): boolean {
    if (typeof window === 'undefined') return false;

    const referrer = document.referrer;
    const currentPath = window.location.pathname;

    // Si estamos en /shop y venimos de /cart, /checkout, o /profile, restaurar estado
    if (currentPath === '/shop') {
        if (referrer.includes('/cart') ||
            referrer.includes('/checkout') ||
            referrer.includes('/profile') ||
            referrer.includes('/shop')) {
            return true;
        }
    }

    return false;
}

// 🆕 NAVEGACIÓN PERSISTENTE - Función para marcar navegación desde shop
export function markNavigationFromShop() {
    if (typeof window !== 'undefined') {
        // Persistir estado actual antes de navegar
        persistFiltersImmediately();
        console.log("💾 State persisted before navigation from shop");

        sessionStorage.setItem('navigatedFromShop', 'true');
        sessionStorage.setItem('shopNavigationTime', Date.now().toString());
    }
}

// 🆕 NAVEGACIÓN PERSISTENTE - Función para verificar si navegamos desde shop recientemente
export function recentlyNavigatedFromShop(): boolean {
    if (typeof window === 'undefined') return false;

    const navigatedFromShop = sessionStorage.getItem('navigatedFromShop');
    const navigationTime = sessionStorage.getItem('shopNavigationTime');

    if (navigatedFromShop === 'true' && navigationTime) {
        const timeDiff = Date.now() - parseInt(navigationTime);
        // Si fue hace menos de 10 minutos, considerar como navegación reciente
        if (timeDiff < 10 * 60 * 1000) {
            return true;
        }
    }

    // Limpiar markers antiguos
    sessionStorage.removeItem('navigatedFromShop');
    sessionStorage.removeItem('shopNavigationTime');
    return false;
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
    if (lp === "null")
        return ""
    return generateRandomString(10) + lp;
}
function decryptLP(encryptLP: string) {
    if (encryptLP === "null")
        return ""
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

// 🆕 NAVEGACIÓN PERSISTENTE - Función para actualizar opciones disponibles después de restaurar
export function updateAvailableOptionsAfterRestore() {
    // Esta función requiere acceso a catalogRelations, que se carga en CatalogFilters
    // La implementaremos de manera que funcione con los stores directamente

    console.log("Updating available options after restore...");

    // Esta función será llamada desde CatalogFilters después de cargar el catálogo
    // Por ahora, solo registramos que se necesita actualizar
}

// 🆕 NAVEGACIÓN PERSISTENTE - Función de debug para verificar estado
export function debugAppState(context: string = "") {
    const state = {
        context,
        timestamp: new Date().toISOString(),
        products: {
            length: get(products)?.length || 0,
            isArray: Array.isArray(get(products)),
            value: get(products)
        },
        stores: {
            currentPage: get(currentPage),
            totalPages: get(totalPages),
            textToSearch: get(textToSearch),
            selectedBrand: get(selectedBrand)?.name || null,
            selectedGroup: get(selectedGroup)?.name || null,
            selectedSubgroup: get(selectedSubgroup)?.name || null,
            hasMoreProducts: get(hasMoreProducts),
            loading: get(loading),
            totalRecords: get(totalRecords)
        },
        localStorage: {
            hasFilters: !!localStorage.getItem('lastCatalogFilters'),
            filtersSize: localStorage.getItem('lastCatalogFilters')?.length || 0
        },
        sessionStorage: {
            navigatedFromShop: sessionStorage.getItem('navigatedFromShop'),
            shopNavigationTime: sessionStorage.getItem('shopNavigationTime')
        }
    };

    console.log(`🐛 Debug App State [${context}]:`, state);
    return state;
}

// 🆕 FUNCIÓN DE PRUEBA - Para debugging de paginación
export function testPaginationRestore() {
    console.log("🧪 Testing pagination restore functionality");

    // Simular estado guardado
    const testState: FilterState = {
        textToSearch: "test",
        selectedBrand: null,
        selectedGroup: null,
        selectedSubgroup: null,
        currentPage: 3,
        totalProducts: 60,
        scrollPosition: 500,
        timestamp: Date.now()
    };

    console.log("Saving test state:", testState);
    localStorage.setItem('lastCatalogFilters', JSON.stringify(testState));
    lastAppliedFilters.set(testState);

    console.log("Current page before test:", get(currentPage));
    console.log("Call restoreCatalogState() to test");
}

// 🆕 FUNCIÓN DE VERIFICACIÓN - Para verificar estado actual
export function checkCurrentState() {
    const state = {
        currentPage: get(currentPage),
        totalPages: get(totalPages),
        products: get(products).length,
        textToSearch: get(textToSearch),
        savedState: get(lastAppliedFilters),
        hasMoreProducts: get(hasMoreProducts)
    };

    console.log("📊 Current App State:", state);
    return state;
}

// 🆕 FUNCIÓN DE DEBUG - Para verificar localStorage en navegador  
export function debugLocalStorage() {
    if (typeof window === 'undefined') {
        console.log("❌ Not in browser environment");
        return null;
    }

    console.log("🔍 DEBUG: Complete localStorage inspection");

    // Verificar localStorage completo
    const allLocalStorage: { [key: string]: string | null } = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            allLocalStorage[key] = localStorage.getItem(key);
        }
    }

    console.log("📦 All localStorage keys:", Object.keys(allLocalStorage));
    console.log("📦 Full localStorage content:", allLocalStorage);

    // Verificar específicamente el filtro
    const catalogFilters = localStorage.getItem('lastCatalogFilters');
    console.log("🎯 lastCatalogFilters raw:", catalogFilters);

    if (catalogFilters) {
        try {
            const parsed = JSON.parse(catalogFilters);
            console.log("🎯 lastCatalogFilters parsed:", parsed);
            console.log("🎯 Filter details:", {
                textToSearch: parsed.textToSearch,
                selectedBrand: parsed.selectedBrand,
                selectedGroup: parsed.selectedGroup,
                selectedSubgroup: parsed.selectedSubgroup,
                currentPage: parsed.currentPage,
                totalProducts: parsed.totalProducts,
                timestamp: new Date(parsed.timestamp).toISOString(),
                ageInMinutes: (Date.now() - parsed.timestamp) / (1000 * 60)
            });
        } catch (error) {
            console.error("❌ Error parsing lastCatalogFilters:", error);
        }
    } else {
        console.log("⚠️ No lastCatalogFilters found in localStorage");
    }

    // Verificar current store values
    console.log("🏪 Current store values:", {
        currentPage: get(currentPage),
        textToSearch: get(textToSearch),
        selectedBrand: get(selectedBrand),
        selectedGroup: get(selectedGroup),
        selectedSubgroup: get(selectedSubgroup),
        products: get(products)?.length || 0,
        lastAppliedFilters: get(lastAppliedFilters)
    });

    return {
        localStorage: allLocalStorage,
        catalogFilters: catalogFilters ? JSON.parse(catalogFilters) : null,
        currentStores: {
            currentPage: get(currentPage),
            textToSearch: get(textToSearch),
            selectedBrand: get(selectedBrand),
            selectedGroup: get(selectedGroup),
            selectedSubgroup: get(selectedSubgroup),
            products: get(products)?.length || 0
        }
    };
}

// 🆕 FUNCIÓN DE FORZAR PERSISTENCIA - Para testing manual
export function forcePersistCurrentState() {
    if (typeof window === 'undefined') {
        console.log("❌ Not in browser environment");
        return;
    }

    console.log("🔄 Forcing persistence of current state...");

    const currentState = {
        textToSearch: get(textToSearch),
        selectedBrand: get(selectedBrand),
        selectedGroup: get(selectedGroup),
        selectedSubgroup: get(selectedSubgroup),
        currentPage: get(currentPage),
        totalProducts: get(products)?.length || 0,
        scrollPosition: window.scrollY,
        timestamp: Date.now()
    };

    console.log("💾 State to persist:", currentState);

    localStorage.setItem('lastCatalogFilters', JSON.stringify(currentState));
    lastAppliedFilters.set(currentState);

    console.log("✅ State persisted manually");
    console.log("🔍 Verify with debugLocalStorage()");
}

// 🆕 FUNCIÓN DE LIMPIEZA DE CACHÉ - Para limpiar datos del catálogo
export function clearCatalogCache() {
    if (typeof window === 'undefined') {
        console.log("❌ Not in browser environment");
        return;
    }

    console.log("🧹 Clearing catalog cache...");
    console.log("ℹ️ Note: Catalog cache auto-expires every 5 minutes");

    // Limpiar localStorage
    const catalogKeys = ['lastCatalogFilters', 'catalogData', 'catalogRelations'];
    catalogKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`✅ Removed ${key} from localStorage`);
        }
    });

    // Limpiar sessionStorage
    const sessionKeys = ['navigatedFromShop', 'shopNavigationTime'];
    sessionKeys.forEach(key => {
        if (sessionStorage.getItem(key)) {
            sessionStorage.removeItem(key);
            console.log(`✅ Removed ${key} from sessionStorage`);
        }
    });

    // Resetear stores relacionados con catálogo
    brands.set([]);
    availableGroups.set([]);
    availableSubgroups.set([]);
    selectedBrand.set(null);
    selectedGroup.set(null);
    selectedSubgroup.set(null);
    catalogData.set(null);
    catalogLoading.set(false);

    // Limpiar caché del CatalogRelations
    catalogRelations.clearCache();

    console.log("🧹 Catalog cache cleared successfully");
    console.log("🔄 Refresh the page to reload fresh catalog data");

    return true;
}

// 🆕 FUNCIÓN DE RECARGA FORZADA - Para forzar recarga del catálogo
export async function forceReloadCatalog() {
    if (typeof window === 'undefined') {
        console.log("❌ Not in browser environment");
        return;
    }

    console.log("🔄 Forcing catalog reload...");

    // Limpiar caché primero
    clearCatalogCache();

    // Forzar recarga del catálogo usando CatalogRelations
    try {
        await catalogRelations.forceReload();
        console.log("✅ Fresh catalog data loaded via CatalogRelations");
        console.log("🔄 You may need to refresh the page to see changes");
    } catch (error) {
        console.error("❌ Error loading fresh catalog via CatalogRelations:", error);

        // Fallback al método manual
        const timestamp = Date.now();
        const catalogUrl = `/static/catalog-relations.json?v=${timestamp}`;

        console.log(`📥 Fallback: Fetching fresh catalog from: ${catalogUrl}`);

        fetch(catalogUrl, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("✅ Fresh catalog data loaded (fallback):", {
                    brands: data.catalog?.brands?.length || 0,
                    groups: data.catalog?.groups?.length || 0,
                    subgroups: data.catalog?.subgroups?.length || 0,
                    lastUpdated: data.lastUpdated
                });

                // Opcional: guardar en localStorage con nueva data
                localStorage.setItem('catalogData', JSON.stringify(data));
                console.log("💾 Fresh catalog cached");
                console.log("🔄 You may need to refresh the page to see changes");
            })
            .catch(fallbackError => {
                console.error("❌ Error loading fresh catalog (fallback):", fallbackError);
            });
    }
}

// 🆕 FUNCIÓN DE INFORMACIÓN DE CACHÉ - Para verificar configuración actual
export function getCacheInfo() {
    if (typeof window === 'undefined') {
        console.log("❌ Not in browser environment");
        return null;
    }

    console.log("📊 Cache Configuration Info:");
    console.log("- Catalog cache TTL: 5 minutes");
    console.log("- Filter persistence TTL: 5 minutes");
    console.log("- Navigation memory: 10 minutes");

    // Verificar estado actual del caché
    const catalogCache = localStorage.getItem('immer-catalog-relations');
    const filtersCache = localStorage.getItem('lastCatalogFilters');

    if (catalogCache) {
        try {
            const parsed = JSON.parse(catalogCache);
            const age = (Date.now() - parsed.timestamp) / (1000 * 60);
            console.log(`📦 Catalog cache age: ${age.toFixed(1)} minutes`);
            console.log(`📦 Catalog cache expires in: ${Math.max(0, 5 - age).toFixed(1)} minutes`);
        } catch (error) {
            console.log("📦 Catalog cache: Invalid data");
        }
    } else {
        console.log("📦 Catalog cache: Empty");
    }

    if (filtersCache) {
        try {
            const parsed = JSON.parse(filtersCache);
            const age = (Date.now() - parsed.timestamp) / (1000 * 60);
            console.log(`🔍 Filters cache age: ${age.toFixed(1)} minutes`);
            console.log(`🔍 Filters cache expires in: ${Math.max(0, 5 - age).toFixed(1)} minutes`);
        } catch (error) {
            console.log("🔍 Filters cache: Invalid data");
        }
    } else {
        console.log("🔍 Filters cache: Empty");
    }

    return {
        catalogCacheTtl: 5,
        filtersCacheTtl: 5,
        navigationMemoryTtl: 10
    };
}

// 🆕 NAVEGACIÓN PERSISTENTE - Exponer funciones de debug en global para pruebas en navegador
if (typeof window !== 'undefined') {
    // @ts-ignore
    window.debugImmerCatalog = {
        debugLocalStorage,
        forcePersistCurrentState,
        debugAppState,
        testPaginationRestore,
        checkCurrentState,
        restoreCatalogState,
        clearCatalogState,
        clearCatalogCache,        // 🆕 Función para limpiar caché del catálogo
        forceReloadCatalog,      // 🆕 Función para forzar recarga del catálogo
        getCacheInfo             // 🆕 Función para obtener información de configuración de caché
    };
    console.log("🧪 Debug functions available in window.debugImmerCatalog");
    console.log("🧹 Use clearCatalogCache() to clear catalog cache");
    console.log("🔄 Use forceReloadCatalog() to force reload catalog data");
    console.log("ℹ️ Use getCacheInfo() to check current cache configuration");
}