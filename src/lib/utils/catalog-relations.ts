/**
 * Catalog Relations Utility
 * Manages the bidirectional relationships between Brands, Groups, and Subgroups
 */

// Allow override via environment variable for external sources
const CATALOG_URL = import.meta.env.VITE_CATALOG_URL || '/catalog-relations.json';
const CACHE_KEY = 'immer-catalog-relations';
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes - Reducido para desarrollo más ágil

export class CatalogRelations {
    private catalog: CatalogData | null = null;

    /**
     * Load catalog data from JSON file with caching
     */
    async loadCatalog(): Promise<CatalogData> {
        // Try cache first
        const cached = this.getCachedData();
        if (cached) {
            this.catalog = cached;
            return cached;
        }

        try {
            console.log('Loading catalog from JSON file...');
            const response = await fetch(CATALOG_URL);
            const catalogFile: CatalogRelationsFile = await response.json();

            this.catalog = catalogFile.catalog;

            // Cache the data
            this.setCachedData(this.catalog);

            return this.catalog;
        } catch (error) {
            console.error('Error loading catalog:', error);

            // Try to use expired cache as fallback
            const expiredCache = localStorage.getItem(CACHE_KEY);
            if (expiredCache) {
                const { data } = JSON.parse(expiredCache);
                console.log('Using expired cache as fallback');
                this.catalog = data;
                return data;
            }

            throw new Error('Failed to load catalog data');
        }
    }

    /**
     * Get cached data if valid
     */
    private getCachedData(): CatalogData | null {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
                console.log('Using cached catalog data');
                return data;
            }
        } catch (error) {
            console.error('Error reading cache:', error);
        }
        return null;
    }

    /**
     * Cache data with timestamp
     */
    private setCachedData(data: CatalogData): void {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Error setting cache:', error);
        }
    }

    /**
     * Clear cached catalog data
     */
    clearCache(): void {
        try {
            localStorage.removeItem(CACHE_KEY);
            this.catalog = null;
            console.log('🧹 Catalog cache cleared');
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    /**
     * Force reload catalog from server (bypassing cache)
     */
    async forceReload(): Promise<CatalogData> {
        this.clearCache();

        try {
            console.log('🔄 Force reloading catalog from server...');
            const timestamp = Date.now();
            const response = await fetch(`${CATALOG_URL}?v=${timestamp}`, {
                method: 'GET',
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const catalogFile: CatalogRelationsFile = await response.json();
            this.catalog = catalogFile.catalog;

            // Cache the fresh data
            this.setCachedData(this.catalog);

            console.log('✅ Catalog force reloaded successfully:', {
                brands: this.catalog.brands.length,
                groups: this.catalog.groups.length,
                subgroups: this.catalog.subgroups.length,
                lastUpdated: catalogFile.lastUpdated
            });

            return this.catalog;
        } catch (error) {
            console.error('❌ Error force reloading catalog:', error);
            throw error;
        }
    }

    /**
     * Ensure catalog is loaded
     */
    private ensureCatalog(): void {
        if (!this.catalog) {
            throw new Error('Catalog not loaded. Call loadCatalog() first.');
        }
    }

    // ========== FILTERING DOWNWARDS ==========

    /**
     * Get groups available for a specific brand
     */
    getGroupsByBrand(brandId: string): CatalogGroup[] {
        this.ensureCatalog();
        return this.catalog!.groups.filter(group =>
            group.brandIds.includes(brandId)
        );
    }

    /**
     * Get subgroups available for a specific brand
     */
    getSubgroupsByBrand(brandId: string): CatalogSubgroup[] {
        this.ensureCatalog();
        return this.catalog!.subgroups.filter(subgroup =>
            subgroup.brandIds.includes(brandId)
        );
    }

    /**
     * Get subgroups for a specific group, optionally filtered by brand
     */
    getSubgroupsByGroup(groupId: string, brandId?: string): CatalogSubgroup[] {
        this.ensureCatalog();
        return this.catalog!.subgroups.filter(subgroup =>
            subgroup.groupId === groupId &&
            (!brandId || subgroup.brandIds.includes(brandId))
        );
    }

    /**
     * Get groups available when filtering by brand and/or other criteria
     */
    getAvailableGroups(brandId?: string): CatalogGroup[] {
        this.ensureCatalog();
        if (!brandId) {
            return this.catalog!.groups;
        }
        return this.getGroupsByBrand(brandId);
    }

    /**
     * Get subgroups available when filtering by brand and/or group
     */
    getAvailableSubgroups(brandId?: string, groupId?: string): CatalogSubgroup[] {
        this.ensureCatalog();

        let subgroups = this.catalog!.subgroups;

        if (brandId) {
            subgroups = subgroups.filter(s => s.brandIds.includes(brandId));
        }

        if (groupId) {
            subgroups = subgroups.filter(s => s.groupId === groupId);
        }

        return subgroups;
    }

    // ========== RESOLVING UPWARDS ==========

    /**
     * Get the primary brand for a subgroup (first brand if multiple)
     */
    getBrandBySubgroup(subgroupId: string): CatalogBrand | null {
        this.ensureCatalog();
        const subgroup = this.catalog!.subgroups.find(s => s.id === subgroupId);
        if (!subgroup || subgroup.brandIds.length === 0) return null;

        // Return first brand (primary)
        const brandId = subgroup.brandIds[0];
        return this.catalog!.brands.find(b => b.id === brandId) || null;
    }

    /**
     * Get the group for a subgroup
     */
    getGroupBySubgroup(subgroupId: string): CatalogGroup | null {
        this.ensureCatalog();
        const subgroup = this.catalog!.subgroups.find(s => s.id === subgroupId);
        if (!subgroup) return null;

        return this.catalog!.groups.find(g => g.id === subgroup.groupId) || null;
    }

    /**
     * Get all brands available for a group
     */
    getBrandsByGroup(groupId: string): CatalogBrand[] {
        this.ensureCatalog();
        const group = this.catalog!.groups.find(g => g.id === groupId);
        if (!group) return [];

        return this.catalog!.brands.filter(brand =>
            group.brandIds.includes(brand.id)
        );
    }

    // ========== VALIDATION ==========

    /**
     * Check if a combination of brand/group/subgroup is valid
     */
    isValidCombination(brandId?: string, groupId?: string, subgroupId?: string): boolean {
        this.ensureCatalog();

        // If subgroup is selected, validate it against group and brand
        if (subgroupId) {
            const subgroup = this.catalog!.subgroups.find(s => s.id === subgroupId);
            if (!subgroup) return false;

            // Check if subgroup belongs to the selected group
            if (groupId && subgroup.groupId !== groupId) return false;

            // Check if subgroup belongs to the selected brand
            if (brandId && !subgroup.brandIds.includes(brandId)) return false;
        }

        // If group is selected, validate it against brand
        if (groupId && brandId) {
            const group = this.catalog!.groups.find(g => g.id === groupId);
            if (!group || !group.brandIds.includes(brandId)) return false;
        }

        return true;
    }

    // ========== GETTERS ==========

    /**
     * Get all brands
     */
    getAllBrands(): CatalogBrand[] {
        this.ensureCatalog();
        return this.catalog!.brands;
    }

    /**
     * Get all groups
     */
    getAllGroups(): CatalogGroup[] {
        this.ensureCatalog();
        return this.catalog!.groups;
    }

    /**
     * Get all subgroups
     */
    getAllSubgroups(): CatalogSubgroup[] {
        this.ensureCatalog();
        return this.catalog!.subgroups;
    }

    /**
     * Find brand by ID
     */
    getBrandById(brandId: string): CatalogBrand | null {
        this.ensureCatalog();
        return this.catalog!.brands.find(b => b.id === brandId) || null;
    }

    /**
     * Find group by ID
     */
    getGroupById(groupId: string): CatalogGroup | null {
        this.ensureCatalog();
        return this.catalog!.groups.find(g => g.id === groupId) || null;
    }

    /**
     * Find subgroup by ID
     */
    getSubgroupById(subgroupId: string): CatalogSubgroup | null {
        this.ensureCatalog();
        return this.catalog!.subgroups.find(s => s.id === subgroupId) || null;
    }

    /**
     * Get cache info
     */
    getCacheInfo(): { cached: boolean, timestamp?: number, age?: number } {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return { cached: false };

        try {
            const { timestamp } = JSON.parse(cached);
            return {
                cached: true,
                timestamp,
                age: Date.now() - timestamp
            };
        } catch {
            return { cached: false };
        }
    }
}

// Singleton instance
export const catalogRelations = new CatalogRelations();
