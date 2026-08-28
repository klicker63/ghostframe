# GhostFrame Studios website

Static Vite multi-page site for GhostFrame Studios and its portfolio. GhostFrame is the parent company; GhostGate remains the primary commercial product, with its proof, release-check, evidence, security, and pilot routes preserved as a product-specific system.

## Public routes

- `/` — GhostFrame Studios company homepage
- `/work/` — primary systems, maturity boundaries, and preserved product paths
- `/work/municipal-intelligence/` — GhostFrame Municipal Property Risk Report, Tampa scope, pricing, methodology, limitations, and quote-first coverage-review intake
- `/work/municipal-intelligence/sample-report/` — redacted validation-based preliminary sample report with evidence appendix
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

The Municipal Intelligence intake submits JSON to `POST /api/municipal-intelligence-lead`. It creates a lead and coverage-review request only: it does not authorize a government fee, create a Stripe invoice, place a paid municipal search, or record payment. The endpoint reuses the existing Resend delivery pattern, returns a deterministic submission reference, and logs only that reference, timestamp, and delivery outcome.

## Form configuration

Release Check delivery requires:

- `RESEND_API_KEY`
- `RELEASE_CHECK_TO_EMAIL`
- `RELEASE_CHECK_FROM_EMAIL`

Municipal Intelligence delivery reuses those values by default. It can be routed separately with:

- `MUNICIPAL_INTELLIGENCE_TO_EMAIL`
- `MUNICIPAL_INTELLIGENCE_FROM_EMAIL`

The separate Municipal values are optional; `RESEND_API_KEY` remains required.

The endpoint validates and sanitizes bounded fields, does not log submissions, uses no-store responses, and does not write to an application database. If delivery is unavailable, the page exposes a safe direct-email fallback. The separate prepared technical-review email remains centralized in `src/config.js`.

## Municipal Intelligence launch readiness

The canonical local business configuration now records the GhostFrame Studios customer identity and contact path, customer-specific Stripe invoices, a solo two-pass quality review, recipient-specific Google Drive delivery with 14-day link expiration, restricted per-order document folders, the correction-request path, introductory pricing, and operating-time targets. These decisions are resolved and are not website blockers.

The canonical commercial validator reports no configuration or packet errors. Its only remaining owner-configuration fields are the professional reviewer reference and professional review record reference. Public outreach, payment, or fulfillment remains gated until those review records exist. Before the first real customer, separately verify production Resend routing, the current Tampa government fee, and current provider timing.

Website readiness does not prove production email configuration or business authorization. The server-side lead endpoint must fail closed if its Resend key, sender, or recipient is absent, and a deployment must not be treated as a completed commercial launch while the external gates above remain open.

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
