# GhostFrame Launch Platform Roadmap

This is a sequencing document, not a claim that later platform capabilities exist. Advancement depends on proving useful acquisition, qualified conversion, safe operations, and repeated product patterns first.

## Phase 1 — GhostGate readiness tool and internal Launch Engine

Deliver the browser-local readiness check, bounded optional lead capture, validated GhostGate manifest, reusable templates, deterministic generator, privacy-filtered analytics contract, and organic distribution operating system.

Exit evidence: people complete the tool without coaching; outputs are useful; qualified release conversations occur; no answer data is needed for conversion; launch drafts save real founder time.

## Phase 2 — Multiple GhostFrame products

Add manifests for additional first-party products and reuse the generator without product-specific core changes. Introduce schema-version migration tests, product-level event context, claim-review ownership, and separate lead destinations where necessary.

Exit evidence: at least two products use the same schema/templates, shared changes improve both, and product-specific exceptions remain at manifest/template edges.

## Phase 3 — Invite-only founder launch workspaces

Add authentication, organization membership, role-based access, verified seller identity, private manifest editing, draft generation, asset review, consented analytics, audit logs, export/delete controls, and abuse throttling. Keep publishing manual.

Required controls: secure session management, recovery, least privilege, tenant isolation, privacy notice, retention schedule, seller verification, claims-review queue, invite abuse prevention, and admin auditability.

## Phase 4 — Public product discovery and launch pages

Add moderated public listings and product pages only after private workflows are reliable. Require seller verification, claim evidence, prohibited-content checks, disclosure rules, edit history, abuse reporting, privacy-safe analytics, and clear listing status.

Ranking must resist manipulation: exclude paid engagement from organic rank, detect coordinated/fake activity, rate-limit actions, label sponsorship, publish ranking principles, and retain human moderation and appeals.

## Phase 5 — Referrals, launch services, seller tools, and marketplace capabilities

Add permissioned referral configuration, attributable links, partner disclosures, service scopes, seller analytics, collaboration, moderation queues, and quality signals. Prevent self-referrals, cookie stuffing, undisclosed incentives, fake engagement, and spam outreach. Define product-quality thresholds and seller consequences before opening access.

Authentication expands to verified roles and step-up controls for sensitive seller/admin actions. Privacy work covers attribution consent, retention, access/export/delete requests, processor review, and cross-border considerations.

## Phase 6 — Optional transaction or lead-generation monetization

Only after demand and trust controls are demonstrated, consider payments or paid lead generation. Required work includes merchant/seller verification, pricing and fee disclosure, payment security, tax handling, sanctions/fraud review, refunds and disputes, service-delivery evidence, payout holds, legal terms, consumer/business classification, and support ownership.

Paid placement and lead monetization must be labeled and separated from organic ranking. Sellers need clear consent rules for lead use; buyers need privacy notice, deletion routes, and abuse reporting.

## Cross-phase governance

| Risk | Required direction before public scale |
| --- | --- |
| Authentication | Strong account recovery, MFA/step-up for sensitive actions, tenant isolation, role review, session audit |
| Seller verification | Business identity, contact verification, ownership checks, re-verification after material changes |
| Moderation | Written policies, evidence requirements, human review, appeals, emergency removal, audit log |
| Spam prevention | Rate limits, reputation controls, consent boundaries, no scraped outreach, report/block mechanisms |
| Claims review | Approved/prohibited claim sets, proof links, edit history, expiration, sanctions for deception |
| Payments | Trusted processor, minimal payment-data handling, fraud review, payout controls, tax and reconciliation |
| Refunds | Visible policy, delivery milestones, dispute evidence, fair escalation and response times |
| Privacy | Data inventory, minimization, purpose limitation, retention, access/export/delete, processor contracts |
| Analytics | Consent-aware collection, no sensitive product inputs, aggregation, retention limits, provider portability |
| Ranking manipulation | Transparent signals, anomaly review, anti-coordination controls, sponsored labeling, appeals |
| Fake engagement | Identity/reputation signals, rate limits, network analysis, human review, removal policy |
| Product quality | Minimum listing completeness, verified links, claims evidence, freshness checks, user reports |
| Legal terms | Seller/buyer terms, acceptable use, IP, disclosures, privacy terms, service boundaries, jurisdiction review |
| Abuse reporting | Accessible report flow, triage severity, preservation, response targets, reporter safety, appeals |

## Architectural extension points already present

- `seller_id`, `organization_id`, `seller_identity`
- multiple `offers` and `related_products`
- `referral_configuration`
- `listing_visibility` and `moderation_state`
- explicit approved and prohibited claims
- product and launch status
- lead-destination indirection
- provider-neutral analytics adapter
- product-scoped generated output

These fields preserve migration paths; v0.1 exposes no public seller controls or marketplace surface.
