"use client";

import { useEffect, useRef, useState } from "react";
import { fileToDataUrl, frameToDataUrl } from "@/lib/image";
import { addPhoto } from "@/lib/store";

type Facing = "environment" | "user";

function explain(err: unknown): string {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError" || name === "SecurityError")
    return "Camera permission was denied. Allow camera access in your browser settings, or choose a photo instead.";
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "No camera was found on this device. Choose a photo instead.";
  if (name === "NotReadableError")
    return "The camera is busy in another app. Close it and try again.";
  return err instanceof Error ? err.message : "The camera could not be started.";
}

export function CameraPanel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [live, setLive] = useState(false);
  const [facing, setFacing] = useState<Facing>("environment");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "ok"; text: string } | null>(null);

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const start = async (mode: Facing) => {
    setMessage(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setMessage({ kind: "error", text: "Live camera needs a secure (https) page and a supported browser. Choose a photo instead." });
      return;
    }
    setBusy(true);
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      setFacing(mode);
      setLive(true);
      requestAnimationFrame(() => {
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          void v.play();
        }
      });
    } catch (e) {
      setMessage({ kind: "error", text: explain(e) });
    } finally {
      setBusy(false);
    }
  };

  const snap = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) {
      setMessage({ kind: "error", text: "The camera is not ready yet. Wait a second and try again." });
      return;
    }
    try {
      addPhoto(frameToDataUrl(v));
      setMessage({ kind: "ok", text: "Photo saved to the user record." });
      stop();
    } catch (e) {
      setMessage({ kind: "error", text: explain(e) });
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setMessage(null);
    setBusy(true);
    try {
      addPhoto(await fileToDataUrl(file));
      setMessage({ kind: "ok", text: "Photo saved to the user record." });
    } catch (e) {
      setMessage({ kind: "error", text: explain(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border p-5" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <h2 className="font-semibold">Capture</h2>
      <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
        Use the live camera, or open the phone camera or photo library with the button below.
      </p>

      <div
        className="mt-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg"
        style={{ background: "#0c0a09" }}
      >
        {live ? (
          <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        ) : (
          <span className="px-6 text-center text-sm text-stone-400">Camera is off</span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {live ? (
          <>
            <button onClick={snap} className="btn-primary">Take photo</button>
            <button onClick={() => start(facing === "environment" ? "user" : "environment")} disabled={busy} className="btn">
              Switch camera
            </button>
            <button onClick={stop} className="btn">Turn off</button>
          </>
        ) : (
          <>
            <button onClick={() => start(facing)} disabled={busy} className="btn-primary">
              {busy ? "Starting..." : "Start camera"}
            </button>
            <label className="btn cursor-pointer">
              Open camera or choose photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => {
                  void onFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </>
        )}
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-3 min-h-5 text-sm"
        style={{ color: message?.kind === "error" ? "#b91c1c" : "var(--brand)" }}
      >
        {message?.text}
      </p>
    </div>
  );
}
