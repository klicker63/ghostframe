# GhostFrame Launch Engine v0.1

## Purpose and boundary

The Launch Engine turns a validated product manifest into editable organic-launch drafts. GhostGate is the first product, but the schema, templates, validator, generator, analytics contract, and lead-capture boundary are product primitives. This milestone does not implement accounts, seller workspaces, public listings, payments, referrals, moderation workflows, or a marketplace.

The manifest at `launch/products/ghostgate.yaml` is the launch source of truth. Public-page copy remains manually maintained in v0.1; generated assets are drafts and never publish automatically.

## Architecture

| Layer | Files | Responsibility |
| --- | --- | --- |
| Product definition | `launch/product.schema.json`, `launch/products/*.yaml` | Valid, bounded product, offer, seller, claim, channel, and future-platform data |
| Templates | `launch/templates/*.tmpl` | Reusable channel structures using allowlisted scalar placeholders |
| Validation | `scripts/manifest-lib.mjs`, `scripts/validate-product-manifest.mjs` | JSON Schema validation plus prohibited-claim checks |
| Generation | `scripts/generate-launch-package.mjs` | Deterministic, local, no-API rendering into `launch/generated/<product-id>/` |
| Acquisition tool | `tools/agent-release-readiness/`, `src/readiness-*.js` | Browser-local assessment, result, Permission Envelope, and optional conversion |
| Lead transport | `api/readiness-lead.js` | Bounded, validated email delivery with no application database |
| Measurement | `src/analytics.js` | Vendor-neutral, privacy-filtered event contract with a no-op default |

## Commands

```text
npm run launch:validate
npm run launch:generate
npm run launch:generate -- --force
```

Validation runs before generation. Generation refuses to overwrite any existing asset unless `--force` is explicit. It creates the output directory only under `launch/generated/<validated-product-id>/`.

## Manifest contract

The v0.1 manifest requires:

- identity: manifest version, product ID, product name, category, status, and launch status;
- positioning: tagline, problem, target users, buyer roles, and core promise;
- acquisition and offer: free tool, paid offer, top-level price, payment terms, delivery target, scope, and exclusions;
- proof: evidence, proof links, screenshots, and demo assets;
- conversion: primary CTA, secondary CTA, tracking parameters, and lead destination environment-variable name;
- identity and governance: founder, company, seller identity, approved public claims, prohibited claims, channels, outreach angles, and keywords;
- future-compatible fields: seller ID, organization ID, multiple offers, related products, referral configuration, listing visibility, and moderation state.

Future fields are data contracts only. Their presence does not imply seller authentication, public listing, referral, or moderation features exist.

## Template and generation safety

- Product IDs use a strict lowercase slug and cannot contain separators, traversal segments, or absolute paths.
- Output filenames and template filenames are an internal allowlist; manifest values never become filenames.
- Only `{{lowercase_placeholder}}` tokens are supported. Missing or unknown placeholders fail generation.
- Templates interpolate approved manifest data as plain text. They do not evaluate code, expressions, HTML, nested templates, or filesystem references.
- The manifest’s prohibited-claim phrases are checked against publishable manifest content and every generated asset.
- Approved public claims enter drafts only through the `public_claims` values. Authors must not add unsupported claims during human review.
- Every asset begins with a draft/human-review warning.
- No paid model or AI API is called.
- Output is deterministic for the same manifest and template bytes. No current time, random ID, or remote content is inserted.

## Readiness scoring model

The assessment contains exactly 15 control questions. Each question maps to one or more of eight dimensions with documented integer weights:

1. Authority risk
2. Permission discipline
3. Data exposure
4. Approval strength
5. Adversarial exposure
6. Version control
7. Observability
8. Recovery readiness

Maturity values are deterministic:

| Answer | Credit |
| --- | ---: |
| Fully implemented and verified | 1.00 |
| Partially implemented | 0.62 |
| Planned but not implemented | 0.30 |
| Not implemented | 0.00 |
| Not applicable | 0.42 |

“Not applicable” is deliberately not full credit. It can remain a priority gap when a selected capability makes the related control important.

Selected risk-bearing capabilities do not subtract points directly. Instead, each matching control question receives an importance multiplier: `min(2.4, 1 + 0.28 × matching capabilities)`. For example, terminal execution increases the importance of tool inventory, prompt exposure, environment separation, permission enforcement, and adversarial testing. Write/delete access, financial actions, deployments, email sending, authenticated browser sessions, multi-agent delegation, persistent memory, and external untrusted content have their own explicit mappings in `src/readiness-engine.js`.

For each dimension, the engine divides weighted earned credit by weighted possible credit and rounds once to a whole-number score. Overall score is the mean of the eight rounded dimension scores. The visible bands are Established (75–100), Developing (50–74), and Weak (0–49). They describe control maturity, not probability of compromise.

Result boundaries are:

- **Prepared for scoped assessment:** overall at least 75, no dimension below 55, and—when consequential capabilities are selected—none of authority, approval, permission-boundary, version, or adversarial controls may be merely planned or absent.
- **Release blockers indicated:** overall below 48, any dimension below 30, or at least two of those hard controls are merely planned or absent while consequential capabilities are selected.
- **Control gaps remain:** every other result.

Priority gaps sort by `(1 - maturity credit) × capability importance × sum of question dimension weights`, with question ID as the stable tie-breaker. The first three are shown. Suggested restrictions follow explicit capability/control rules. No random value, model call, or opaque scoring occurs.

## Permission Envelope generation

The local generator produces structured fields for agent name, immutable version, environment, allowed tools, prohibited operations, approved identities, data boundaries, human approvals, allowed systems, execution limits, logging, invalidation triggers, category, and a limitation notice. JSON, YAML, and the Markdown result summary are created locally. They are samples requiring owner review.

## Analytics contract and privacy

Supported events are:

- `readiness_check_started`
- `readiness_question_completed`
- `readiness_check_completed`
- `permission_envelope_copied`
- `result_downloaded`
- `release_check_cta_clicked`
- `lead_form_started`
- `lead_form_submitted`
- `launch_asset_link_clicked`

`src/analytics.js` allowlists both event names and properties. It rejects unknown events and drops unknown properties. The allowed payload contains only question number/category, readiness category, dimension count, output format, source, and bounded UTM values. Assessment answers, agent profile fields, emails, free-text context, credentials, and Permission Envelope content are never analytics properties.

The default adapter is a no-op. In local Vite development only, add `?analytics_debug=1` to show the on-page privacy-filtered event inspector. Production builds cannot enable that inspector.

To add a provider later, implement an object with `track(payload)`, initialize `createAnalytics({ adapter, context: getUtmContext() })`, and keep provider-specific consent/loading behavior outside the scoring engine. Do not weaken the event/property allowlists. UTM parameters are retained in memory and added to the paid Release Check link; they are not stored with assessment answers.

## Lead-capture data boundary

The optional client constructs an explicit payload containing contact fields, result category, at most three high-level dimension IDs, optional user context, consent, honeypot, and a random non-secret correlation marker. It never serializes the answer map, profile, score details, or Permission Envelope. The server also rejects payloads containing `answers`, `assessment`, or `questions` keys.

The endpoint validates types, required fields, email, category, dimension allowlist, marker shape, field lengths, payload bytes, same-site intent, consent, honeypot, and spam patterns. It normalizes text, escapes HTML, returns no-store JSON, logs no submitted content, uses Reply-To for the work email, and has safe provider-failure responses. It writes to no application database.

## Adding the next product

1. Copy the manifest structure to `launch/products/<safe-id>.yaml`.
2. Enter only reviewed public facts and explicit prohibited claims.
3. Reuse templates; add a new generic placeholder only when multiple products need it.
4. Validate and generate without `--force` first.
5. Review every draft against channel rules and current claims.
6. Add product-specific landing/tool UI separately; do not place product-specific behavior in the generator core.

## Environment variables

- `RESEND_API_KEY`
- `READINESS_LEAD_TO_EMAIL` (optional when `RELEASE_CHECK_TO_EMAIL` is configured)
- `READINESS_LEAD_FROM_EMAIL` (optional when `RELEASE_CHECK_FROM_EMAIL` is configured)
- Existing Release Check transport: `RELEASE_CHECK_TO_EMAIL`, `RELEASE_CHECK_FROM_EMAIL`

No environment values belong in the manifest, generated assets, client bundle, logs, or responses.
