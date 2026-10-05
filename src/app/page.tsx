"use client";

import { useSyncExternalStore } from "react";
import { CameraPanel } from "@/components/CameraPanel";
import { clearAll, getServerSnapshot, getSnapshot, removePhoto, setCurrent, subscribe } from "@/lib/store";

const card = { background: "var(--card)", borderColor: "var(--line)" };
const muted = { color: "var(--muted)" };

function shorten(url: string) {
  const kb = Math.round((url.length * 0.75) / 1024);
  return `${url.slice(0, 34)}... (${kb} KB)`;
}

export default function Home() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const current = state.photos.find((p) => p.id === state.currentId) ?? null;

  const record = {
    id: "user_demo_01",
    name: "Alex Morgan",
    profilePhotoUrl: current ? shorten(current.dataUrl) : null,
    photoUpdatedAt: current?.takenAt ?? null,
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex items-center gap-3">
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
          <rect width="36" height="36" rx="9" fill="var(--brand)" />
          <path d="M9 13h4l2-3h6l2 3h4v13H9z" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="18" cy="19.5" r="3.6" fill="none" stroke="#fff" strokeWidth="2.2" />
        </svg>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Photo Capture App</h1>
          <p className="text-sm" style={muted}>Take a photo and save it to a user record.</p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <CameraPanel />

        <div className="space-y-6">
          <div className="rounded-xl border p-5" style={card}>
            <h2 className="font-semibold">User record</h2>
            <div className="mt-4 flex items-center gap-4">
              <div
                className="h-20 w-20 shrink-0 overflow-hidden rounded-full border"
                style={{ borderColor: "var(--line)", background: "var(--bg)" }}
              >
                {current ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={current.dataUrl} alt="Current profile photo" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs" style={muted}>No photo</div>
                )}
              </div>
              <div>
                <p className="font-medium">{record.name}</p>
                <p className="text-sm" style={muted}>Demo user, stored in this browser only</p>
              </div>
            </div>
            <pre
              className="mt-4 overflow-x-auto rounded-lg p-3 text-xs leading-relaxed"
              style={{ background: "var(--bg)" }}
            >
              {JSON.stringify(record, null, 2)}
            </pre>
          </div>

          <div className="rounded-xl border p-5" style={card}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Saved photos</h2>
              {state.photos.length > 0 && (
                <button onClick={clearAll} className="text-sm underline" style={muted}>Clear all</button>
              )}
            </div>
            {state.photos.length === 0 ? (
              <p className="mt-3 text-sm" style={muted}>Nothing saved yet. Take a photo to start.</p>
            ) : (
              <ul className="mt-3 grid grid-cols-4 gap-2">
                {state.photos.map((p) => (
                  <li key={p.id} className="relative">
                    <button
                      onClick={() => setCurrent(p.id)}
                      aria-label="Use this photo as the profile photo"
                      aria-pressed={p.id === state.currentId}
                      className="block w-full overflow-hidden rounded-md border-2"
                      style={{ borderColor: p.id === state.currentId ? "var(--brand)" : "transparent" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.dataUrl} alt="" className="aspect-square w-full object-cover" />
                    </button>
                    <button
                      onClick={() => removePhoto(p.id)}
                      aria-label="Delete this photo"
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white"
                    >
                      x
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-10 border-t pt-4 text-xs" style={{ borderColor: "var(--line)", ...muted }}>
        Demo project. Photos stay in your browser (localStorage) and are never uploaded. In a real app the same flow would
        upload the file to storage and save its URL on the user record.
      </footer>
    </main>
  );
}
