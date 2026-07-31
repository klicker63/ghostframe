# GhostFrame Studios website

Static Vite multi-page site for GhostGate and the GhostFrame Studios portfolio. GhostGate is the primary commercial product; Proofline and the other studio projects remain available through the Studio route.

## Public routes

- `/` — GhostGate commercial homepage
- `/ghostgate/` — detailed product and qualification workflow
- `/proof/` — controlled, deterministic, synthetic, and cryptographic proof
- `/pilot/` — six-week paid qualification pilot
- `/security/` — security model, data handling, human authority, and limitations
- `/studio/` — GhostFrame parent-studio portfolio
- `/contact/` — prepared direct-email technical review request
- `/ghostgate/evidence/` — legacy sanitized evidence-format sample
- `/proofline/` — Proofline product page

The canonical production origin is `https://www.ghostframestudios.com/`.

## Local development

~~~powershell
npm install
npm run dev
~~~

Vite serves the public pages and downloadable evidence. The existing Vercel Function at `POST /api/pilot-request` remains in the repository for backward compatibility, but the commercial GhostGate routes use a direct email CTA and do not expose a web form.

## Contact configuration

The temporary review email, subject, and prepared message body are centralized in `src/config.js`. Replace `CONTACT_EMAIL` there when a branded mailbox becomes available.

## Verification

~~~powershell
npm run lint
npm test
npm run build
git diff --check
~~~

Before release, also inspect every public route at desktop, tablet, and mobile widths; check console output and horizontal overflow; verify the prepared mail draft; and scan source and `dist/` for secrets, private paths, obsolete domains, and unsupported claims.

## Public evidence policy

Only sanitized evidence approved for public release belongs in `public/evidence/`. Never publish raw evaluation archives, internal run identifiers, local paths, customer data, private repository information, proprietary prompts, credentials, or secrets.

The `/proof/` page distinguishes current evidence categories:

- controlled live external proof;
- local deterministic validation;
- synthetic fleet capacity, explicitly labeled as non-production;
- cryptographic verification.

No customer production validation or production fleet-scale validation is claimed.

## Deployment

The existing `vercel.json`, `.vercel` project linkage, security headers, Vite configuration, and serverless endpoint remain in place. Do not change domains or DNS from this repository. Deploy only after an explicit release decision.
