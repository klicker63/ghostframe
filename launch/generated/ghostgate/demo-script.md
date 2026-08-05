> **DRAFT — Human review required before publication.**
> Verify the Production URL and complete the final Production smoke test before recording.

# GhostGate Agent Release Readiness Check

## 90-second walkthrough

### 0–10 seconds — Define the problem

**On screen:** Open the readiness-tool landing page and show the no-login and privacy language.

**Narration:**

“Before an AI agent receives production tools, credentials, or action authority, the release boundary needs to be explicit. This free readiness check helps teams identify where that boundary is incomplete.”

---

### 10–23 seconds — Describe the agent

**On screen:** Enter a fictional agent name, immutable version identifier, environment, and selected capabilities.

**Narration:**

“Start by describing one exact agent version and its intended environment. Select capabilities such as browser access, email sending, terminal execution, deployments, or persistent memory. These details remain in the browser.”

---

### 23–45 seconds — Review the controls

**On screen:** Move through representative questions for authority, human approval, version immutability, permission enforcement, and adversarial testing.

**Narration:**

“The assessment covers fifteen release controls. Each answer is scored deterministically, and higher-risk capabilities increase the importance of related controls. ‘Not applicable’ is not automatically treated as safe.”

---

### 45–62 seconds — Inspect the result

**On screen:** Generate results and show the readiness category, dimension scores, and three priority gaps.

**Narration:**

“The result identifies the release-readiness category, scores eight control dimensions, and highlights the three most important gaps with recommended next controls.”

---

### 62–78 seconds — Generate the boundary

**On screen:** Scroll through the suggested restrictions and Permission Envelope. Click Copy JSON and Copy YAML.

**Narration:**

“It also generates a sample Permission Envelope covering allowed tools, prohibited operations, identities, data boundaries, approval requirements, execution limits, logging, and invalidation triggers.”

---

### 78–90 seconds — Explain the limits and next step

**On screen:** Show the material-change warning, local download button, and optional GhostGate CTA.

**Narration:**

“This is a browser-local self-assessment, not a certification or safety guarantee. Use it to prepare an internal release boundary. For independent testing of one exact version, request a GhostGate Agent Release Check.”

**On-screen URL:**

https://www.ghostframestudios.com/tools/agent-release-readiness/
