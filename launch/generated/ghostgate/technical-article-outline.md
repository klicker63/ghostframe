> **DRAFT — Human review required before publication.** Verify channel rules, claims, links, and current product details.

# Technical article outline

## Working title

An AI agent release is a versioned permission decision

## Audience

AI product founders preparing an agent for production; engineering teams integrating tool-using agents; security and governance teams reviewing agent authority and evidence.

## Thesis

An agent name or model name is not a release identity. A defensible release decision must describe one exact behavior-shaping configuration, the authority granted to it, the evidence reviewed, and the changes that invalidate that decision.

## Reader outcome

A reader should be able to draft a release boundary for one agent version, identify the controls that become more important as capabilities expand, and define when the boundary must be reviewed again.

## Structure

### 1. Replace “Is the agent safe?” with a bounded release question

- Open with two agents that share the same product name but have different tools, identities, and permissions.
- Ask: which exact version may perform which exact operations, against which systems, under whose approval?
- Explain that a bounded question supports review and testing; it does not establish zero risk.

### 2. Define the release identity

- Record the immutable build or version identifier.
- Include the model, system instructions, agent code, orchestration, retrieval sources, memory behavior, tools, permissions, policy baseline, and deployment configuration.
- Distinguish a product label from the configuration that actually shapes behavior.

### 3. Inventory capabilities at the operation level

- “Browser access” can mean reading public documentation or acting through an authenticated session; those are different boundaries.
- “Email access” should separate drafting, reading, sending, deleting, forwarding, and changing recipients.
- “Terminal access” should name allowed commands, filesystem boundaries, network destinations, credentials, and isolation.
- Show how vague tool labels hide consequential operations.

### 4. Weight controls by capability—without pretending to calculate risk

- Explain that a control can matter more when a related capability is selected; the weighting prioritizes review effort rather than estimating a probability of harm.
- Example: terminal execution raises the importance of tool inventory, environment separation, permission enforcement, and adversarial testing.
- Example: external email or message sending raises the importance of action-level authority, human approval, untrusted-content handling, permission enforcement, and logging.
- Example: persistent memory raises the importance of data boundaries, provenance, logging, invalidation rules, retention, and an operator-visible reset path.
- State the limitation: reported controls and weighted scores cannot verify implementation quality or prove safety.

### 5. Separate instructions from enforceable permissions

- A prompt that says “ask before sending” is not an external approval gate.
- Describe allowlisted operations, scoped identities, destination restrictions, rate or action limits, and denial by default.
- Show where enforcement should sit outside the model’s own decision process.

### 6. Bind approval to one exact consequential action

- The reviewer should see the operation, target, material parameters, identity, and expected effect.
- Retries, edits, changed recipients, and delegated actions should not inherit stale approval.
- Name the accountable release owner and exception path.

### 7. Express the boundary as a Permission Envelope

- Introduce the Permission Envelope as a structured planning artifact for one agent configuration.
- Cover allowed tools and operations, prohibited operations, approved identities, data boundaries, allowed systems, approval requirements, execution limits, logging, and invalidation triggers.
- Include a short sanitized example and annotate who owns each field.
- Make clear that the envelope requires human review and enforcement; generating it does not make the boundary real.

### 8. Define material-change invalidation before release

- Walk through an example: version 1.4 is reviewed without persistent memory; version 1.5 adds memory and a new authenticated browser tool.
- Explain why the earlier result should not silently transfer, even if the product name and top-level task stay the same.
- List change categories that should trigger review: model, instructions, tools, permissions, code, orchestration, retrieval, memory, policy, or deployment.
- Clarify that reassessment is a scope rule, not a claim that every change is unsafe.

### 9. Preserve evidence and a recovery path

- Record secret-safe decisions, approvals, tool calls, outcomes, errors, and version identifiers.
- Test revocation, stop, rollback, evidence preservation, and escalation before production authority is granted.
- Explain why logs without version identity or approval context are difficult to use in a release decision.

### 10. Know what a readiness self-assessment cannot establish

- It can expose missing definitions, weak controls, and review priorities.
- It cannot inspect implementation quality, discover unknown behavior, recreate every hostile condition, certify compliance, or guarantee safety.
- Independent testing is a separate activity and should remain bound to the tested version and agreed scope.

## Capability-weighting example table

| Capability | Controls to scrutinize first | Reason |
| --- | --- | --- |
| Authenticated browser session | Data boundaries, untrusted-content handling, permission enforcement, logging | A signed-in session can combine external instructions with access to sensitive actions or records. |
| Deployment access | Approval, environment separation, version control, recovery | One action can change production code, configuration, or state. |
| Multi-agent delegation | End-to-end authority, cumulative limits, logging, recovery | Individually acceptable steps can combine or propagate through child agents. |
| Persistent memory | Provenance, retention, write controls, invalidation, reset | State can carry sensitive data or untrusted instructions across runs. |

## Evidence and visuals needed

- Sanitized sample Permission Envelope with field ownership annotations
- One diagram from release identity to permissions, evidence, decision, and invalidation
- One before-and-after material-change example
- One capability-to-control comparison table
- Optional readiness-tool screenshots used only where they clarify the model

## Product mention and CTA

Keep the product reference to a short disclosure near the end: the author built the free GhostGate readiness self-assessment to help teams apply this model. Link once with the clean URL.

Assess an Agent: https://www.ghostframestudios.com/tools/agent-release-readiness/

## Editorial guardrails

- Teach the release-control model before mentioning GhostGate.
- Do not publish exact internal scenario libraries or proprietary testing procedures.
- Do not present a weighted score as a probability of compromise.
- Do not imply certification, complete coverage, or guaranteed safety.
- Keep the paid assessment to one brief distinction if needed; do not turn the article into a product pitch.
