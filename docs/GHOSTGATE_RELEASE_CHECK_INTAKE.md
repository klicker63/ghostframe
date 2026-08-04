# GhostGate Release Check Technical Intake

This checklist begins after GhostFrame reviews the public scope request and confirms that the proposed agent may be suitable for the fixed Release Check. It documents the information needed to establish a testable, version-bound assessment. It must not contain real credentials or secrets.

## Intake handling rules

- Do not paste passwords, API keys, access tokens, private keys, production cookies, customer records, proprietary prompts, production data, or other secrets into this document.
- Do not send production credentials by email or through the public website form.
- Use placeholders to describe credential types and scopes, for example `SCOPED_TEST_TOKEN`.
- Transfer approved test access only through the secure method agreed with GhostFrame after scope review.
- Prefer disposable, least-privilege sandbox identities and synthetic or sanitized fixtures.
- Identify sensitive materials by category and handling requirement without including their values.

## 1. Buyer and technical contacts

- Legal company name
- Primary business contact
- Primary technical contact
- Security or release-decision owner
- Time zone and availability during the target assessment window
- Authorized person for scope and release-evidence receipt

## 2. Agent identity and purpose

- Agent or product name
- Intended user and business purpose
- Exact version, commit, image digest, package digest, or immutable build identifier
- Build date
- Release channel or environment under consideration
- Expected users and operating context
- Explicitly expected behaviors
- Explicitly prohibited behaviors
- Known concerns, prior findings, or incidents relevant to the assessment

The build identifier must be stable enough to tie the findings and signed attestation to the assessed subject.

## 3. System composition

- Model provider and model identifier
- Model configuration relevant to behavior
- Orchestration framework and version
- Agent code version
- System instructions or an approved sufficient test representation
- Retrieval components and source categories
- Memory components, persistence behavior, and reset method
- Supporting services and dependencies that influence agent decisions
- Approval, policy, or human-in-the-loop components

Use sanitized excerpts or a controlled test representation when full materials are not required or approved for transfer.

## 4. Tools, operations, and action paths

For every available tool or system, document:

- tool or system name;
- business purpose;
- operations the agent may invoke;
- operations the agent must never invoke;
- read, write, update, delete, execute, approve, or administrative capabilities;
- direct and indirect action paths;
- approval-bound operations;
- relevant rate, transaction, or data-volume limits;
- downstream systems affected by a successful action; and
- available rollback or reset procedure.

Do not include live endpoint secrets, credentials, or private tokens.

## 5. Permission and credential boundaries

Describe, without providing secret values:

- test identity types;
- intended permission scopes;
- denied or unavailable permissions;
- role and group memberships;
- credential rotation or revocation method;
- whether credentials are shared with other components;
- approval requirements;
- tenancy or workspace boundaries; and
- expected least-privilege state.

The assessment should use scoped sandbox or test credentials whenever possible. Production credentials are not part of the public intake and are not presumed necessary.

## 6. Test environment readiness

Select the supported assessment path agreed with GhostFrame:

- scoped sandbox;
- test endpoint;
- supported adapter;
- controlled execution package; or
- another specifically approved source of execution evidence.

Document:

- environment identifier;
- access window;
- test data or fixture description;
- reset procedure;
- network constraints;
- expected availability;
- logging or evidence-export capabilities;
- prohibited actions;
- rate or cost limits; and
- technical contact for access problems.

The environment must be usable before the seven-business-day target begins.

## 7. Policy baseline

- Policy baseline name and version
- Source or owner of the policy
- Allowed behaviors
- Denied behaviors
- Conditional or approval-bound behaviors
- Escalation requirements
- Data-handling constraints
- Tool-specific restrictions
- Any known ambiguity requiring explicit resolution before testing

The Release Check includes one policy baseline. Multiple baselines require a changed scope or the private pilot.

## 8. Proposed scenario priorities

Identify the highest-value release questions across:

- prompt and instruction manipulation;
- tool misuse;
- excessive permissions;
- confused-deputy behavior;
- unsafe multi-step action chains;
- alternate-path retries;
- data exposure and exfiltration attempts;
- policy confusion;
- approval bypass attempts; and
- behavior inconsistent with the agent’s stated purpose.

GhostFrame and the buyer will agree on up to 20 scenarios. The assessment is targeted and does not claim exhaustive coverage.

## 9. Evidence and sharing requirements

- Intended technical reviewers
- Intended executive or procurement reviewers
- Whether evidence may be shared with an enterprise customer
- Required sanitization boundaries
- Approved company and product identifiers
- Restricted data categories
- Preferred evidence-delivery contact
- Any contractual handling requirements that must be resolved before kickoff

Evidence sharing must preserve the tested version, configuration, scope, verdict definition, limitations, and material-change policy.

## 10. Readiness confirmation

Before kickoff, confirm that:

- the exact assessed version is identified and stable;
- the tested configuration is documented;
- the tool and permission boundary is documented;
- the policy baseline is agreed;
- up to 20 scenarios can be agreed without expanding the offer;
- the sandbox, endpoint, adapter, or execution package is usable;
- reset and rollback procedures are available;
- test access is scoped and contains no unnecessary production authority;
- the technical contact can support the assessment window;
- no credentials or secrets appear in this checklist; and
- the buyer understands that form submission and intake review do not promise acceptance.

## Material-change reminder

Changes to the model, system instructions, tool access, permissions, agent code, orchestration, retrieval sources, memory behavior, policy baseline, or deployment configuration may invalidate the release evidence and signed attestation. Report proposed changes before the included retest so GhostFrame can determine whether they remain within the same-version, same-scope boundary.
