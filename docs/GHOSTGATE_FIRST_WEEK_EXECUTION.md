# GhostGate First-Week Execution

**Prepared:** 2026-08-04  
**Execution window:** Wednesday 2026-08-05 through Tuesday 2026-08-11  
**Message source:** `docs/GHOSTGATE_OUTREACH_BATCH_01.md`  
**System of record:** `docs/GHOSTGATE_OUTREACH_TRACKER.csv`

## Non-negotiable operating rules

- AJ sends messages manually. No mass outreach, sequencing software, mail merge, scraping, or automated sending.
- Contact no more than two new companies on any day.
- Use only the primary route in the verified-routes report. Do not contact the same person through email, X, LinkedIn, GitHub, Discord, a form, or another channel on the same day.
- Re-open the exact route source immediately before sending. If the route is no longer public, do not guess a replacement.
- Enter the actual `date_sent` immediately after each send and calculate `follow_up_due` as three business days later.
- Send Message C only when there has been no response and no decline. One follow-up is the maximum.
- Stop outreach immediately after any decline or request not to contact. Record the response and set `next_action` to `Closed — declined`.
- A bounce is not permission to infer another address. Record it, stop that sequence, and perform a new verification pass before considering any secondary route.
- Do not contact Browserbase or Cindy. Do not use paid LinkedIn messaging.
- Do not open accounts, join communities, post in GitHub issues, or submit demo/support forms to execute this plan.

## Day 1 — Wednesday, 2026-08-05

### New contact 1: Retell AI

1. Open the [Retell route source](https://www.retellai.com/changelog/latest-updates-from-retell-lower-prices-enhanced-security-and-multilingual-support) and confirm `founders@retellai.com` is still published.
2. Open `GHOSTGATE_OUTREACH_BATCH_01.md`, section **1. Retell AI**, and send **Message B — direct email** manually.
3. Send only to the one published founder inbox; do not copy another founder or submit a form.
4. Immediately set `date_sent=2026-08-05`, `follow_up_due=2026-08-10`, and `next_action=Wait for response; if silent, send Message C on 2026-08-10` in the tracker.
5. If Retell replies, record the substance in `response`; accept a technical-fit call only when an owner is identified.

### New contact 2: Lindy

1. Open [Flo Crivello's route source](https://flocrivello.com/home/) and confirm the written personal address still appears.
2. Open the outreach batch, section **2. Lindy**, and send **Message B — direct email** manually.
3. Do not also use Flo's X account or any Lindy form.
4. Immediately set `date_sent=2026-08-05`, `follow_up_due=2026-08-10`, and the corresponding wait action in the tracker.

**End-of-day check:** exactly two new companies at most; every actual send or non-send is recorded. Do not contact Gumloop early.

## Day 2 — Thursday, 2026-08-06

### New contact 1: Gumloop

1. Re-open [Gumloop's route source](https://gumloop.ghost.io/about/) and confirm `founders@gumloop.com` remains public.
2. Use the outreach batch, section **3. Gumloop**, **Message B — direct email**.
3. Do not also use a demo form, support route, or community.
4. Set the actual `date_sent`; if sent today, set `follow_up_due=2026-08-11` and record the wait action.

### New contact 2: Skyvern

1. Re-open [Skyvern's founder route](https://www.ycombinator.com/launches/LEg-skyvern-cloud-open-source-ai-agent-to-automate-browser-based-workflows) and confirm `suchintan@skyvern.com` remains published.
2. Use the outreach batch, section **4. Skyvern**, **Message B — direct email**.
3. Do not open a GitHub issue or use a user community as a second route.
4. Set the actual `date_sent`; if sent today, set `follow_up_due=2026-08-11` and record the wait action.

**End-of-day check:** no more than two new companies. Review replies to Day 1, but do not follow up early.

## Day 3 — Friday, 2026-08-07

### New contact: Hyperbrowser

1. Re-open [Hyperbrowser's founder route](https://www.ycombinator.com/launches/MeQ-hyperbrowser-web-infrastructure-for-ai-agents) and confirm `shri@hyperbrowser.ai` remains public.
2. Use the outreach batch, section **5. Hyperbrowser**, **Message B — direct email**.
3. Send only to Shri; do not copy the second founder or duplicate the message elsewhere.
4. Set the actual `date_sent`; if sent today, set `follow_up_due=2026-08-12` and `next_action=Wait; if silent, send Message C on 2026-08-12`.

### Reply handling

- For any positive response, identify the accountable release owner, candidate version, connected tools, Permission Envelope owner, approver, and intake/access readiness. Update those tracker fields before scheduling a call.
- For a referral, thank the sender and record the referred public route. Do not contact the new person until the referral or public route is clear.
- For an objection, record it verbatim or as a faithful short summary. Do not improvise claims beyond the public offer.

**End-of-day check:** one new company planned; no early follow-ups.

## Day 4 — Monday, 2026-08-10

### Retell three-business-day follow-up

1. Check the tracker and mailbox. If Retell replied, bounced, or declined, do not send a follow-up.
2. If there is no response and the initial email was actually sent on 2026-08-05, use section **1. Retell AI**, **Message C — one useful follow-up**.
3. Record the follow-up in `notes`, set `next_action=Wait for response; no further follow-up`, and retain the original `date_sent`.

### Lindy three-business-day follow-up

1. Apply the same response/decline/bounce check.
2. Only if silent after an actual 2026-08-05 send, use section **2. Lindy**, **Message C — one useful follow-up**.
3. Record it and set `next_action=Wait for response; no further follow-up`.

**New companies today:** zero. Do not use Message D or a secondary channel merely because three business days have passed.

## Day 5 — Tuesday, 2026-08-11

### Gumloop three-business-day follow-up

1. If the 2026-08-06 email was sent and there is no reply, bounce, or decline, use section **3. Gumloop**, **Message C — one useful follow-up**.
2. Record it and close further follow-up activity unless the team responds.

### Skyvern three-business-day follow-up

1. If the 2026-08-06 email was sent and there is no reply, bounce, or decline, use section **4. Skyvern**, **Message C — one useful follow-up**.
2. Record it and close further follow-up activity unless the team responds.

### Hyperbrowser check

- Do not follow up today. Its three-business-day due date is Wednesday 2026-08-12. If still silent then, use section **5. Hyperbrowser**, **Message C**, once.

**New companies today:** zero.

## How to use the other message variants

- **Message A** is available only if a newly verified permission-based route replaces an email route. None of the five primary routes needs it.
- **Message D** is a routing question for a moderator or employee who is not the buyer. No such route is currently recommended. Use it only after a fresh verification shows that the venue permits the question; never post it in a community that prohibits solicitation.
- Do not convert either message into a GitHub issue, support request, privacy inquiry, or product-demo submission.

## Technical-fit call gate

Before treating a reply as a qualified opportunity, confirm:

1. One exact candidate agent version and tested configuration can be frozen.
2. The customer can define the Permission Envelope and up to 20 agreed scenarios.
3. Usable test access and intake materials can be ready.
4. A named approver understands the $5,000 fixed fee, with $2,500 due at kickoff and $2,500 at delivery.
5. The customer understands the seven-business-day target begins only after intake and access readiness.
6. The customer understands the verdict is Pass, Conditional Pass, or Block for the tested version, not certification or a general safety guarantee.

## Exact first action

At the start of Day 1, AJ should re-open Retell's published-route page, confirm `founders@retellai.com` is still present, then manually send **Outreach Batch 01 → 1. Retell AI → Message B** and immediately log the actual send and 2026-08-10 follow-up date in the tracker.
