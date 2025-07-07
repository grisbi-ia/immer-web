#!/bin/bash

# Script para Limpiar Caché del Catálogo - IMMER
# Útil cuando se actualiza el JSON de marcas, grupos y subgrupos

echo "🧹 Limpieza de Caché del Catálogo - IMMER"
echo "========================================"
echo ""

echo "📋 Este script te ayuda a limpiar el caché cuando actualizas:"
echo "- static/catalog-relations.json"
echo "- Datos de marcas, grupos y subgrupos"
echo "- Relaciones entre filtros"
echo ""

echo "🔧 Métodos disponibles:"
echo ""

echo "1️⃣  MÉTODO RÁPIDO - Desde Consola del Navegador:"
echo "   • Abrir DevTools (F12) → Console"
echo "   • Ejecutar: window.debugImmerCatalog.clearCatalogCache()"
echo "   • Recargar página (F5)"
echo ""

echo "2️⃣  MÉTODO COMPLETO - Forzar Recarga:"
echo "   • En Console: window.debugImmerCatalog.forceReloadCatalog()" 
echo "   • Recargar página (F5)"
echo ""

echo "3️⃣  MÉTODO MANUAL - Limpiar Navegador:"
echo "   • DevTools → Application → Storage"
echo "   • Limpiar localStorage y sessionStorage"
echo "   • Recargar página (Ctrl+Shift+R)"
echo ""

echo "4️⃣  MÉTODO AUTOMÁTICO - Este Script:"
echo "   • Mata el servidor de desarrollo si está corriendo"
echo "   • Limpia caché de build"
echo "   • Reinicia servidor"
echo ""

read -p "¿Quieres ejecutar el método automático? (y/N): " confirm
if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    echo ""
    echo "🔄 Ejecutando limpieza automática..."
    
    # Matar procesos de Node.js que pueden estar usando el puerto
    echo "🛑 Deteniendo servidor de desarrollo..."
    pkill -f "vite.*dev" 2>/dev/null || true
    pkill -f "npm.*dev" 2>/dev/null || true
    sleep 2
    
    # Limpiar caché de build
    echo "🧹 Limpiando caché de build..."
    rm -rf .svelte-kit 2>/dev/null || true
    rm -rf node_modules/.vite 2>/dev/null || true
    rm -rf build 2>/dev/null || true
    
    # Verificar que el JSON existe y es válido
    if [ -f "static/catalog-relations.json" ]; then
        echo "✅ Verificando JSON del catálogo..."
        if jq empty static/catalog-relations.json 2>/dev/null; then
            echo "✅ JSON válido: static/catalog-relations.json"
            echo "📊 Estadísticas:"
            echo "   - Marcas: $(jq '.catalog.brands | length' static/catalog-relations.json)"
            echo "   - Grupos: $(jq '.catalog.groups | length' static/catalog-relations.json)"
            echo "   - Subgrupos: $(jq '.catalog.subgroups | length' static/catalog-relations.json)"
            echo "   - Última actualización: $(jq -r '.lastUpdated' static/catalog-relations.json)"
        else
            echo "❌ ERROR: JSON inválido en static/catalog-relations.json"
            echo "⚠️  Corrige el JSON antes de continuar"
            exit 1
        fi
    else
        echo "❌ ERROR: No se encontró static/catalog-relations.json"
        exit 1
    fi
    
    # Reiniciar servidor
    echo "🚀 Reiniciando servidor de desarrollo..."
    npm run dev &
    
    echo ""
    echo "✅ Limpieza automática completada"
    echo "🌐 El servidor estará disponible en: http://localhost:5173"
    echo "🧹 El caché del catálogo se limpiará automáticamente"
    echo ""
    echo "📝 Instrucciones adicionales:"
    echo "   1. Espera que cargue el servidor (30-60 segundos)"
    echo "   2. Abre http://localhost:5173/shop"
    echo "   3. Si necesitas limpieza adicional, usa la consola:"
    echo "      window.debugImmerCatalog.clearCatalogCache()"
    
else
    echo ""
    echo "ℹ️  Puedes usar los métodos manuales descritos arriba"
    echo "🔗 Para más información, consulta: docs/CORRECCION_PERSISTENCIA.md"
fi

echo ""
echo "🔧 Archivos relacionados con caché del catálogo:"
echo "   - static/catalog-relations.json (fuente de datos)"
echo "   - localStorage: catalogData, lastCatalogFilters"
echo "   - sessionStorage: navigatedFromShop, shopNavigationTime"
echo "   - src/lib/utils/catalog-relations.ts (lógica de carga)"
