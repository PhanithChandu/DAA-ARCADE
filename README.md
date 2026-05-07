<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b3b3311b-60ea-4226-a441-d7a5b18d8d69

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy on Vercel

This project is a Vite SPA.

### Build settings

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Environment variables

Your local `.env.local` is intentionally git-ignored (see `.gitignore`), so Vercel will not have it.

In the Vercel dashboard for your project, add:

- `GEMINI_API_KEY` = your Gemini API key

Then **redeploy**.

If `GEMINI_API_KEY` is missing, the app will still load, but AI features (chat + audio explanations) will show an “AI is offline” message.
