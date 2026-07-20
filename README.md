# GhostFrame Studios website

Static Vite site for GhostFrame Studios, GhostGate, the GhostGate public evidence sample, and Proofline. The private-pilot form uses a Vercel Function for email delivery and keeps a prepared direct-email fallback.

## Routes

- / — studio homepage
- /ghostgate/ — GhostGate product page and private-pilot form
- /ghostgate/evidence/ — sanitized Agent Trust Report and Permission Envelope
- /proofline/ — Proofline product page

## Local development

Install the dependencies and run the static site:

~~~powershell
npm install
npm run dev
~~~

Vite serves the pages and downloadable public evidence, but it does not execute the Vercel Function. A form submission in Vite development will fail safely and expose the prepared direct-email fallback.

To test the full browser-to-function flow, use Vercel's local runtime:

~~~powershell
npx vercel dev
~~~

No live provider call is needed for unit tests; the provider is mocked there.

## Pilot-request delivery

POST /api/pilot-request accepts JSON after the browser validates required fields. The function independently enforces:

- required fields and deployment-stage allowlisting;
- field-length and 24 KB request limits;
- email formatting and sensitive-data consent;
- a hidden honeypot and obvious URL-spam rejection;
- cross-site submission rejection when the browser supplies Sec-Fetch-Site;
- HTML escaping before provider delivery;
- no-store responses and generic delivery errors.

The endpoint sends through Resend using direct HTTPS and does not store submissions in a website database. It does not log full lead payloads, email addresses, or message content. Provider failures return a safe error and the browser preserves a pre-addressed mailto fallback.

### Environment variables

Copy .env.example to .env.local for local Vercel development and set:

- RESEND_API_KEY — server-only Resend API key.
- PILOT_TO_EMAIL — verified recipient for GhostFrame Studios.
- PILOT_FROM_EMAIL — sender identity verified with Resend.

Never put these values in client-side variables or commit them. If any variable is missing, the function returns a controlled 503 response and directs the user to the email fallback.

### Abuse and rate controls

The application layer uses a small request limit, strict field limits, a honeypot, URL-count checks, and same-site browser checks. In-memory rate limiting is intentionally omitted because Vercel Function instances do not share reliable process memory. Configure a Vercel Firewall rate-limit rule for POST /api/pilot-request before public launch, and monitor provider-side abuse controls.

## Public evidence policy

The evidence route is driven by src/evidence-profiles.js, so another verified profile can be added through configuration without redesigning the page. Only the approved GitHub Sandbox Baseline is currently published.

The current sample is deliberately constrained:

- sanitized public ID: GG-PUBLIC-GH-SAFE-001;
- dry-run, mock GitHub environment with no real GitHub API calls;
- deterministic Safe Agent under the Strict Least Privilege baseline;
- 10 simulated scenarios, 10 passed, 36 attempted actions, 0 findings, and risk score 0;
- approved baseline example with human review required.

Do not publish raw evaluation ZIPs, internal run IDs, timestamps, local paths, customer data, proprietary prompts, credentials, or unverified risky/compromised examples. Every public artifact must be manually compared with a verified source export and carry this boundary:

> This sanitized sample demonstrates GhostGate’s evidence format and evaluation workflow. It does not certify an agent or guarantee safe production behavior.

## Verification

~~~powershell
npm run lint
npm test
npm run build
~~~

After building, scan dist/ for local paths, secret-like strings, unapproved claims, and any raw evaluation identifiers before release.

## Deployment checklist

1. Run lint, tests, and the production build.
2. Review git diff and confirm the related GhostGate product repository is untouched.
3. Configure the three server-only environment variables in Vercel.
4. Verify the Resend sender domain and recipient.
5. Add a Vercel Firewall rate-limit rule for the pilot endpoint.
6. Verify the CSP and other headers on all four public routes.
7. Submit one non-sensitive test lead and confirm delivery plus the fallback path.
8. Recheck the evidence disclaimer, downloads, mobile layout, accessibility, and browser console.
9. Deploy only after an explicit release approval.