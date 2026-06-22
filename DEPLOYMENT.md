# GhostFrame Studios Deployment Guide

This project is a static React/Vite website. It does not require a backend, serverless functions, or environment variables.

## Deployment configuration

- Framework preset: **Vite**
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `./`
- Node.js version: use a currently supported Vercel default

Vercel detects this Vite project from `package.json` and `vite.config.js`, so a `vercel.json` file is not required. The generated asset paths use `/assets/...`, which works correctly when the site is deployed at the root of a Vercel domain.

## Local test commands

Run these commands from the project root:

```powershell
npm install
npm run dev
```

Open the local address printed by Vite, normally `http://127.0.0.1:5173` or `http://localhost:5173`.

Test the exact production build locally:

```powershell
npm run build
npm run preview
```

The build must finish successfully and create the `dist` directory. Open the preview address printed by Vite, normally `http://localhost:4173`.

If project images are added later, place them in `public/projects/` and reference them as `/projects/filename.ext` in `src/data/siteContent.js`. Vite will preserve those root-relative URLs in production.

## Push the project to GitHub

1. Create a new, empty repository on GitHub. Do not initialize it with a README, license, or `.gitignore` if this local project already contains files.
2. Replace the placeholder repository URL below with the URL shown by GitHub.
3. Run:

```powershell
git init
git add .
git commit -m "Prepare GhostFrame Studios for Vercel"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

If an `origin` remote already exists, inspect it with `git remote -v`. Update it when necessary with:

```powershell
git remote set-url origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

GitHub reference: [Adding locally hosted code to GitHub](https://docs.github.com/en/get-started/git-basics/adding-locally-hosted-code-to-github)

## Deploy through Vercel using GitHub

1. Sign in to [Vercel](https://vercel.com/) using the GitHub account that can access the repository.
2. In the Vercel dashboard, choose **Add New → Project**.
3. Find the GhostFrame Studios repository and choose **Import**. If it is not listed, grant the Vercel GitHub app access to that repository.
4. Confirm the project configuration:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install` or the detected default
5. No environment variables are needed for this site.
6. Choose **Deploy**.
7. After the build completes, open the generated `*.vercel.app` URL and check the boot sequence, capability selector, project inspector, navigation, and mobile layout.

Once connected, pushes to the production branch create production deployments. Pull requests and other branches can create preview deployments, depending on the project's Git settings.

Vercel references:

- [Deploying Git repositories](https://vercel.com/docs/deployments/git)
- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)

## Connect a custom domain later

1. Open the deployed project in Vercel.
2. Go to **Settings → Domains**.
3. Enter the domain or subdomain and choose **Add**.
4. Vercel will display the DNS records required for the domain. Add those exact records at the DNS provider where the domain is managed.
5. Add both the apex domain and `www` version if both should work, then choose which one redirects to the other.
6. Wait for DNS verification. Vercel provisions HTTPS after the domain is configured successfully.

Do not hard-code a Vercel DNS record from an old guide; use the values displayed for the project when the domain is connected.

Vercel reference: [Adding a domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
