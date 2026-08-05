> **DRAFT — Human review required before publication.**
> Verify the Production URL, current implementation, and public claims before use.

# GhostGate Readiness Check FAQ

## Is this a certification or security verdict?

No.

It is a browser-local self-assessment intended to help a team identify release-control gaps and define a more explicit agent boundary.

It does not certify an agent, guarantee safety, prove complete scenario coverage, or replace independent testing.

The self-assessment result categories are:

- Prepared for scoped assessment
- Control gaps remain
- Release blockers indicated

The paid GhostGate assessment uses a separate human-reviewed process.

---

## How is the result calculated?

The scoring is deterministic rather than AI-generated or probabilistic.

The assessment contains 15 control questions scored across eight dimensions:

- Authority risk
- Permission discipline
- Data exposure
- Approval strength
- Adversarial exposure
- Version control
- Observability
- Recovery readiness

Selected capabilities influence the importance of related controls.

For example, terminal execution, authenticated browser sessions, deployments, email sending, financial actions, multi-agent delegation, and persistent memory increase the weight of controls related to those capabilities.

For the same tool version and inputs, the same result is produced.

---

## Why do capabilities affect the scoring?

A missing approval control has different consequences for a read-only documentation assistant than for an agent that can deploy code, send email, execute terminal commands, or modify customer records.

Capability weighting attempts to reflect that difference without pretending to calculate an exact probability of harm.

---

## Why is “Not applicable” not treated as automatically safe?

Selecting “Not applicable” does not demonstrate that the control is unnecessary or that the related risk cannot occur.

It receives limited credit because the self-assessment cannot independently verify the claimed boundary.

---

## Are assessment answers sent to GhostFrame?

No.

The following run locally in the browser:

- Agent profile
- Assessment answers
- Scoring
- Result generation
- Priority-gap selection
- Suggested restrictions
- Permission Envelope generation
- JSON and YAML copying
- Local summary download

Assessment answers and the generated Permission Envelope are not transmitted.

---

## What does the optional contact form send?

Only when the user explicitly submits it, the form sends:

- Full name
- Work email
- Company
- Agent or product name
- Readiness category
- Selected high-level risk dimensions
- Optional non-sensitive context
- A correlation marker

It does not send:

- The 15 individual answers
- Detailed scores
- The complete agent profile
- The Permission Envelope
- Credentials
- Prompts
- Customer data

---

## Is any assessment data stored in a database?

No application database persistence is used in this version.

The generated result remains in the browser. A user can download a local summary; separately submitting the optional contact form sends only the bounded fields listed above.

---

## What is a Permission Envelope?

A Permission Envelope is a structured description of the release boundary for one agent configuration.

The generated sample includes fields for:

- Agent name
- Version identifier
- Environment
- Allowed tools
- Prohibited operations
- Approved identities
- Data boundaries
- Human-approval requirements
- Allowed domains or systems
- Execution limits
- Logging requirements
- Invalidation triggers

The generated envelope is a planning artifact and must be reviewed before use.

---

## Why bind the assessment to one exact version?

Evidence about one configuration should not silently transfer to a materially different one.

Changes to any of the following may invalidate an earlier result:

- Model
- System instructions
- Prompts
- Tools
- Permissions
- Agent code
- Orchestration
- Retrieval sources
- Memory behavior
- Policy baseline
- Deployment configuration

A version boundary makes it clearer what was actually reviewed.

---

## Why only 15 questions?

The tool is intended to provide a focused first-pass release review rather than an exhaustive security questionnaire.

Each question represents a broader control area. The result is designed to identify where deeper engineering review or independent testing may be useful.

Feedback on missing or underspecified controls is welcome.

---

## Why show three priority gaps instead of every weakness?

The full dimension results remain visible, but the tool selects three priority gaps to give the user an actionable starting point.

Priority combines:

- Control maturity
- Dimension importance
- Selected risk-bearing capabilities

It is not a claim that the remaining gaps are harmless.

---

## Can the scoring prove that an agent is safe?

No.

The scoring reflects reported control maturity and selected capabilities. It cannot verify implementation quality, discover unknown behaviors, inspect proprietary systems, or reproduce hostile operating conditions.

It should be treated as preparation for a release review, not evidence that testing has occurred.

---

## What is GhostGate Agent Release Check?

GhostGate Agent Release Check is the paid independent assessment that follows the readiness tool when a team needs human-reviewed, version-bound release evidence.

The fixed scope covers:

- One AI agent
- One exact version or immutable build
- One tested environment
- One tool and permission configuration
- One policy baseline
- Up to 20 agreed hostile, misuse, permission-boundary, and behavioral scenarios
- One same-version, same-scope remediation retest

The current fixed price is $5,000 USD, with 50% at kickoff and 50% at delivery.

---

## What does the paid assessment deliver?

The current offer includes:

- Pass, Conditional Pass, or Block verdict
- Permission Envelope
- Findings and behavioral evidence
- Version-bound evidence package
- One same-scope remediation retest

It does not provide certification, a legal opinion, guaranteed safety, complete scenario coverage, or automatic transfer of evidence to materially changed releases.

---

## What feedback would be most useful?

Technical feedback is especially helpful on:

- Missing release controls
- Ambiguous answer choices
- Capability-weighting assumptions
- Result-category boundaries
- Priority-gap selection
- Permission Envelope fields
- Privacy or browser-local processing
- Controls that should invalidate earlier evidence
