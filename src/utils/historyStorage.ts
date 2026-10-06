import type { HistoryItem } from '../types';

const DB_NAME = 'purecut_history_db';
const STORE_NAME = 'recent_edits';
const DB_VERSION = 1;
const MAX_HISTORY_ITEMS = 10;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveHistoryItem(item: HistoryItem): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Save new item
    store.put(item);

    // Retrieve all and prune if > MAX_HISTORY_ITEMS
    const allRequest = store.getAll();
    allRequest.onsuccess = () => {
      const all: HistoryItem[] = allRequest.result || [];
      if (all.length > MAX_HISTORY_ITEMS) {
        // Sort ascending by timestamp to prune oldest
        all.sort((a, b) => a.timestamp - b.timestamp);
        const toDeleteCount = all.length - MAX_HISTORY_ITEMS;
        for (let i = 0; i < toDeleteCount; i++) {
          store.delete(all[i].id);
        }
      }
    };

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Could not save item to IndexedDB history:', err);
  }
}

export async function loadHistoryItems(): Promise<HistoryItem[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const items: HistoryItem[] = request.result || [];
        // Sort descending by timestamp (newest first)
        items.sort((a, b) => b.timestamp - a.timestamp);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Could not load IndexedDB history:', err);
    return [];
  }
}

export async function deleteHistoryItem(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Could not delete item from IndexedDB history:', err);
  }
}

export async function clearAllHistory(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Could not clear IndexedDB history:', err);
  }
}
