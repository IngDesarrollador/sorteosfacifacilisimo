/**
 * Utilidad de almacenamiento híbrido (IndexedDB + localStorage + Memoria)
 * Diseñado para evitar el error QuotaExceededError de localStorage al procesar
 * archivos grandes de sorteos con decenas de miles de registros.
 */

const DB_NAME = 'sorteos_facilisimo_db';
const STORE_NAME = 'app_data';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB no soportado'));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Caché en memoria para acceso ultra rápido
const memoryCache: Record<string, string> = {};

/**
 * Guarda un elemento en el almacenamiento.
 * Utiliza IndexedDB para permitir tamaños ilimitados (miles de filas)
 * e intenta guardar en localStorage de forma segura sin romper la aplicación.
 */
export async function setStorageItem(key: string, value: string): Promise<void> {
  memoryCache[key] = value;

  // Intentar guardar en IndexedDB (soporta cientos de megabytes)
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Advertencia al escribir en IndexedDB:', err);
  }

  // Intentar guardar en localStorage solo si el contenido es pequeño (< 500 KB)
  // para evitar por completo el error QuotaExceededError en datasets grandes
  try {
    if (value && value.length < 500000) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignorar */
    }
  }
}

/**
 * Obtiene un elemento almacenado.
 * Busca primero en memoria, luego en IndexedDB, y finalmente en localStorage.
 */
export async function getStorageItem(key: string): Promise<string | null> {
  if (memoryCache[key] !== undefined && memoryCache[key] !== null) {
    return memoryCache[key];
  }

  try {
    const db = await openDB();
    const result = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    if (result !== null && result !== undefined) {
      memoryCache[key] = result;
      return result;
    }
  } catch (err) {
    /* fallback */
  }

  try {
    const val = localStorage.getItem(key);
    if (val !== null && val !== undefined) {
      memoryCache[key] = val;
      return val;
    }
  } catch {
    /* ignorar */
  }

  return null;
}

/**
 * Elimina un elemento del almacenamiento.
 */
export async function removeStorageItem(key: string): Promise<void> {
  delete memoryCache[key];
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignorar */
  }

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* ignorar */
  }
}
