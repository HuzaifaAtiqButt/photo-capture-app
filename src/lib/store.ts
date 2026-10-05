export type Photo = { id: string; dataUrl: string; takenAt: string };
export type State = { photos: Photo[]; currentId: string | null };

const KEY = "photo-capture-app-v1";
const EMPTY: State = { photos: [], currentId: null };
const MAX_PHOTOS = 8;

let cache: State | null = null;
const listeners = new Set<() => void>();

function read(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as State;
    return Array.isArray(parsed.photos) ? parsed : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function getSnapshot(): State {
  if (cache === null) cache = read();
  return cache;
}

export function getServerSnapshot(): State {
  return EMPTY;
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function commit(next: State) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can be full or blocked. The app keeps working for this visit.
  }
  listeners.forEach((l) => l());
}

export function addPhoto(dataUrl: string) {
  const state = getSnapshot();
  const photo: Photo = {
    id: Math.random().toString(36).slice(2, 10),
    dataUrl,
    takenAt: new Date().toISOString(),
  };
  const photos = [photo, ...state.photos].slice(0, MAX_PHOTOS);
  commit({ photos, currentId: photo.id });
}

export function setCurrent(id: string) {
  commit({ ...getSnapshot(), currentId: id });
}

export function removePhoto(id: string) {
  const state = getSnapshot();
  const photos = state.photos.filter((p) => p.id !== id);
  const currentId = state.currentId === id ? (photos[0]?.id ?? null) : state.currentId;
  commit({ photos, currentId });
}

export function clearAll() {
  commit(EMPTY);
}
