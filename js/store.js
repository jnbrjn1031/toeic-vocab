// localStorage 입출력. 깨진 데이터는 지우지 않고 따로 보관한 뒤 기본값으로 시작한다.
import { defaultData, migrate } from './core/records.js';

export const STORAGE_KEY = 'toeic-vocab';

export function loadData(storage = globalThis.localStorage) {
  let raw;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return defaultData();
  }
  if (raw == null) return defaultData();
  try {
    return migrate(JSON.parse(raw));
  } catch {
    try {
      storage.setItem(`${STORAGE_KEY}:corrupt-${Date.now()}`, raw);
    } catch {
      // 보관할 공간도 없으면 포기한다.
    }
    return defaultData();
  }
}

export function saveData(data, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export async function requestPersist() {
  try {
    await globalThis.navigator?.storage?.persist?.();
  } catch {
    // 지원하지 않는 브라우저는 조용히 넘어간다.
  }
}
