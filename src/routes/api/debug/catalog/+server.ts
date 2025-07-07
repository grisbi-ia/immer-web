import { json } from '@sveltejs/kit';

export async function GET() {
    try {
        // Try to fetch the catalog JSON
        const response = await fetch('http://localhost:5174/catalog-relations.json');
        const catalogData = await response.json();

        return json({
            success: true,
            catalogLoaded: true,
            brandsCount: catalogData.catalog.brands.length,
            groupsCount: catalogData.catalog.groups.length,
            subgroupsCount: catalogData.catalog.subgroups.length,
            sampleBrands: catalogData.catalog.brands.slice(0, 3),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
