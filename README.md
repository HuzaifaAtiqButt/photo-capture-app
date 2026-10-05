# Photo Capture App

A small web app that takes a photo with the device camera and saves it to a user record. It works on phones and laptops.

This is a demo project. Photos stay in your browser (localStorage) and are never uploaded. There is no database and no account.

## What it shows

- Live camera preview with a front and back camera switch, built on `getUserMedia`.
- A second path for phones: a file input with the `capture` attribute opens the native camera or photo library.
- Photos are resized to 900 px and compressed before saving.
- A "user record" panel shows how the photo URL would sit on a user, as it would in a real app after an upload.
- Clear messages for permission denied, no camera, camera busy, insecure page, and files that are not images.
- A small history of saved photos, with choose-as-profile and delete.

## Stack

Next.js, React, TypeScript, Tailwind CSS. No camera or image libraries.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. The live camera needs https or localhost. On a phone, use the deployed https version.

## Going further

In a real product the captured file would be uploaded to storage (for example Supabase Storage or S3) and the returned URL saved on the user row. This demo keeps that step local so it can run without any account or keys.
