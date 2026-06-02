/**
 * Limpia todo el caché del navegador cuando la app se carga
 * Incluyendo localStorage, sessionStorage y el caché HTTP
 */
export const clearAllCache = async () => {
  try {
    // Limpiar localStorage
    localStorage.clear();
    
    // Limpiar sessionStorage
    sessionStorage.clear();
    
    // Limpiar el caché HTTP del navegador si está disponible
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    console.log('✓ Caché limpiado correctamente');
  } catch (error) {
    console.error('Error al limpiar el caché:', error);
  }
};
