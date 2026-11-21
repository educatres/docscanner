import type { ScanProject } from '../types'

const DB_NAME = 'paperscan-db'; const STORE = 'projects'; const VERSION = 1

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' })
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error ?? new Error('IndexedDB 無法開啟。'))
  })
}

export async function saveProject(project: ScanProject) {
  const db = await openDb(); await new Promise<void>((resolve, reject) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(project); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error ?? new Error('工作階段保存失敗。')) }); db.close()
}

export async function loadLatestProject(): Promise<ScanProject | null> {
  const db = await openDb(); const projects = await new Promise<ScanProject[]>((resolve, reject) => { const request = db.transaction(STORE).objectStore(STORE).getAll(); request.onsuccess = () => resolve(request.result as ScanProject[]); request.onerror = () => reject(request.error) }); db.close(); return projects.sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null
}

export async function deleteProject(id: string) { const db = await openDb(); await new Promise<void>((resolve, reject) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(id); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error) }); db.close() }
export async function clearProjects() { const db = await openDb(); await new Promise<void>((resolve, reject) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).clear(); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error) }); db.close() }
