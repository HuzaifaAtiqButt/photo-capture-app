const MAX_SIDE = 900;

function fit(w: number, h: number) {
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
}

export function frameToDataUrl(video: HTMLVideoElement): string {
  const { w, h } = fit(video.videoWidth, video.videoHeight);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read the camera image.");
  ctx.drawImage(video, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export async function fileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file is not an image.");
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    const { w, h } = fit(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not read that image.");
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("That")) throw e;
    throw new Error("That image could not be opened. Try a JPG or PNG.");
  } finally {
    URL.revokeObjectURL(url);
  }
}
