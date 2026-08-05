> **DRAFT — Human review required before publication.**
> Verify the production URL and test the complete flow before posting.

# Submission title

Show HN: GhostGate – A browser-local AI agent release readiness check

# Submission URL

https://www.ghostframestudios.com/tools/agent-release-readiness/

# First comment

Hi HN,

I built this while developing GhostGate, an independent release-assessment process for tool-using AI agents.

I kept running into a basic problem: teams can describe what an agent is intended to do, but often cannot state precisely which version, tools, permissions, identities, data boundaries, and approval gates are actually being released.

The Agent Release Readiness Check is a free, no-login self-assessment intended to make that boundary more concrete.

It asks 15 control questions and uses deterministic scoring across eight dimensions:

- authority
- permissions
- data exposure
- human approval
- adversarial exposure
- version control
- observability
- recovery readiness

Capabilities such as terminal execution, authenticated browser sessions, email sending, deployments, financial actions, multi-agent delegation, and persistent memory increase the weight of related controls.

The result includes:

- a readiness category
- dimension-level results
- the three highest-priority gaps
- suggested release restrictions
- a sample Permission Envelope in JSON and YAML
- a locally downloadable summary

The assessment, scoring, and Permission Envelope generation run entirely in the browser. Answers are not transmitted. There is an optional contact form after the result. If submitted, it sends the entered contact fields, readiness category, up to three high-level risk dimensions, optional context, and a non-secret correlation marker—not the individual answers or Permission Envelope.

This is not certification, and it does not claim that an agent is safe. The goal is to help teams define a release boundary that can actually be reviewed, reproduced, and tested.

I would especially value technical feedback on:

- Are any control questions underspecified?
- Are the answer choices too coarse?
- Are any capability weights obviously wrong?
- Is the Permission Envelope useful as a planning artifact?
- Which important release controls are missing?

I’ll be around to answer questions and discuss the scoring model and implementation.
