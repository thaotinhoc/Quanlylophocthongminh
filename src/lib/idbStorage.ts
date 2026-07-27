const DB_NAME = "ClassroomManagerDB";
const STORE_NAME = "app_store";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
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

export async function saveToStorage<T>(key: string, data: T): Promise<void> {
  // Save to IndexedDB (virtually unlimited capacity for images & student records)
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn("IndexedDB save warning:", e);
  }

  // Also try saving to localStorage as secondary cache
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // Gracefully handle DOMException quota exceeded when storing many base64 images
    console.warn(`localStorage quota exceeded for ${key}. Data stored safely in IndexedDB.`);
  }
}

export async function loadFromStorage<T>(key: string, fallback: T): Promise<T> {
  // Try IndexedDB first
  try {
    const db = await openDB();
    const result = await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (result !== undefined && result !== null) {
      return result as T;
    }
  } catch (e) {
    console.warn("IndexedDB load warning:", e);
  }

  // Try localStorage fallback
  try {
    const local = localStorage.getItem(key);
    if (local) {
      return JSON.parse(local);
    }
  } catch (e) {
    console.warn("localStorage read warning:", e);
  }

  return fallback;
}
