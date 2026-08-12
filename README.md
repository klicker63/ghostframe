# GhostFrame Studios website

Static Vite multi-page site for GhostFrame Studios and its portfolio. GhostFrame is the parent company; GhostGate remains the primary commercial product, with its proof, release-check, evidence, security, and pilot routes preserved as a product-specific system.

## Public routes

- `/` — GhostFrame Studios company homepage
- `/work/` — primary systems, maturity boundaries, and preserved product paths
- `/labs/` — research programs, prototypes, and emerging systems
- `/about/` — studio identity, manifesto, and engineering method
- `/demon-core/` — distinct adversarial-testing research experience, including Possession and the restricted Demon Chain teaser
- `/ghostgate/` — detailed product and qualification workflow
- `/ghostgate/release-check/` — $5,000 fixed-scope assessment and secure scope-review form
- `/proof/` — controlled, deterministic, synthetic, and cryptographic proof
- `/pilot/` — $32,000 six-week private qualification pilot
- `/security/` — security model, data handling, human authority, and limitations
- `/studio/` — legacy studio index pointing visitors into the new parent-company architecture
- `/contact/` — studio inquiry, Release Check, and private-pilot contact paths
- `/ghostgate/evidence/` — legacy sanitized evidence-format sample
- `/proofline/` — Proofline product page

The canonical production origin is `https://www.ghostframestudios.com/`.

## Local development

~~~powershell
npm install
npm run dev
~~~

Vite serves the public pages and downloadable evidence. The Release Check request form submits JSON to the Vercel Function at `POST /api/release-check-request`. The existing `POST /api/pilot-request` function remains for backward compatibility.

## Form configuration

Release Check delivery requires:

- `RESEND_API_KEY`
- `RELEASE_CHECK_TO_EMAIL`
- `RELEASE_CHECK_FROM_EMAIL`

The endpoint validates and sanitizes bounded fields, does not log submissions, uses no-store responses, and does not write to an application database. If delivery is unavailable, the page exposes a safe direct-email fallback. The separate prepared technical-review email remains centralized in `src/config.js`.

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
