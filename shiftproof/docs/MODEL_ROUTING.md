# Model routing: Claude, OpenAI Codex, Google Gemini, and DeepSeek

Choose a model by **tier and effort for the task**, not by version number. Versions change, but the tiers stay the same. Look up each tier's current model ID when you assign work, and record the model you used.

## Tiers (the same for every provider)

| Tier | Use it for | Claude | OpenAI (Codex) | Gemini |
|---|---|---|---|---|
| **Frontier** | Architecture, migrations, large refactors, deep research, long unattended runs, independent reviews of high-risk changes, and anything the workhorse missed at high effort | Fable | The flagship OpenAI recommends for the hardest work (GPT-6 Astra; about Fable's equal) | Google's flagship: Carbon where available, otherwise Argon `-high` |
| **Workhorse** | Everyday implementation, debugging, code edits that need judgement, orchestration, final QA | Opus | The near-flagship at lower cost (GPT-6.1 Sol) | Hydrogen `-high` (succeeded Flash) |
| **Mid** | Well-scoped fixes, spec-driven work, repeated investigation, routine reviews and drafting | Sonnet | Same model at medium effort | Hydrogen `-medium` |
| **Light** | Search, log reading, summaries, extraction, classification, triage: work where a mistake is cheap to spot | Haiku | Its efficient high-volume model | Hydrogen `-low` (not for coding) |
| **Specialist** | A provider's niche model, such as image generation or visual reasoning, used only where it fits | | Image models via Codex | |

The model names are current as of November 2026. When a provider renames or reshuffles its line-up, map the new models onto these tiers using the provider's own descriptions.

## Effort

- **Start at medium.** Gemini Hydrogen is the exception: start at high, its default for coding.
- Raise effort one level only when the gain justifies the cost. Before going past high, try the next tier up, since an extra level past high can cost as much as a bigger model.
- Effort doesn't add knowledge. A cheap route is a low-effort run that re-runs only its failures at high.

## When a result falls short

Escalate in this order:

1. Add self-verification (tests, a checklist, reading back the result).
2. Raise effort one level.
3. Move up a tier, starting at lower effort.

## Provider notes

**Claude**
- Keep the expensive model's context for decisions, planning, orchestration, design and final QA. Hand verbose reading and routine edits to cheaper tiers.
- Use aliases (`opus`, `sonnet`, `haiku`) where the tools accept them.
- Fable usually shares the overall Claude weekly limit, so reserve it for high-stakes reviews and decisions, not routine work.

**OpenAI Codex**
- **Always pin the model and reasoning level explicitly.** Desktop apps rewrite the default whenever someone switches models, so an inherited default can turn out to be a different model at low effort.
- The flagship (Astra) reasons about as well as Fable and draws on the Codex quota, so it's the preferred high-stakes reviewer when Claude's limit is under pressure.
- A sandboxed Codex delegate may be unable to run builds that need sockets or system calls, Gradle for example. The supervisor runs the builds and tests.

**Gemini**
- Effort is part of the model ID: `-low`, `-medium`, `-high`, `-xhigh`.
  - Hydrogen defaults to high; 3.8 Flash defaulted to medium.
  - Argon and Carbon default to medium and have no `-xhigh`.
- Hydrogen scores about the same as Argon at high and above it at `-xhigh`. For implementation, try Hydrogen `-xhigh` before moving to Argon.
- Prompting guidance from Google's Gemini 4 docs:
  - Prefer short, direct prompts at a higher thinking level over step-by-step scaffolding.
  - Sampling settings (temperature, top_p, top_k) are ignored.
  - The models don't follow word or length targets, so constrain the output format instead.
  - Put static context first; implicit caching starts at 4,096 tokens.
  - Higher levels explore and verify more. If a run over-uses tools or over-tests, lower the level before rewriting the prompt.
- Read-only agent runs can be strict about which shell commands they may use. List the allowed commands and have the model search files with its own tools.

**DeepSeek (via DSH)**
- A pay-per-token API, not a subscription, and much cheaper per token than the others. Off-peak hours cost about half; check DeepSeek's current peak windows.
- **Roles:**
  - **Reviewer:** read-only reviews of routine and mid-risk changes, re-reviews of narrow fixes, and a second opinion from a different model family.
  - **Fallback:** the destination when another provider's quota is exhausted, or when both flagships are under pressure.
  - **Small implementer:** small, well-scoped implementation tasks.
- Verify its findings before acting. Most are real and specific, but a severe-sounding finding can rest on a mechanism that doesn't hold up in practice, so reproduce it first.
- Keep briefs tightly scoped: give it the exact diff range and the files it may read. Every token is billed.

## Reviews

- Give independent reviews to a **different model family, on a different quota, from the implementer's**. Use a frontier model for high-risk changes and the workhorse or mid tier for routine ones and narrow re-reviews.
- Brief each reviewer as a leaf:
  - give it the exact diff range;
  - make it read-only, with no builds, simulators or nested delegation;
  - keep it out of build output, temp folders and large generated files;
  - ask for findings with severity, file:line and a concrete failing scenario, ending with APPROVE or CHANGES REQUIRED.
- Verify a finding before acting on it: reproduce it, or show why it can't happen. An open finding means the change isn't ready to merge.

## Briefs

- Name the exact paths to read and write, the exclusions, the checks to run, and the evidence to return.
- State how far the delegate may delegate and how much testing to run, because models tend to over-test small tasks.
- Delegates don't commit. The supervisor reviews, tests and commits their work, noting which model wrote it.
- Switch models at natural breaks, because prompt caches are per model.

## Quota

- High usage on one provider reroutes work to another; it doesn't stop work. Check whether another project caused the burn first.
- Only a confirmed exhaustion counts as exhausted; an unknown quota reading doesn't. Don't retry an exhausted model before its reset.
- When a flagship's limit is spent, use another provider's flagship for high-stakes work, or step down to the workhorse at high effort, and say which.
- When the subscription quotas are tight (Claude, Codex, Gemini), route reviews and small tasks to DeepSeek. It's billed per token, so it costs money but has no weekly limit.

## Writing for users

- User-facing copy (app text, labels, error messages) goes to the models whose writing the owner trusts. In our setup that's Anthropic models only.
- Have copy drafted, then approved by the owner before it ships.

## New releases

When a provider ships a successor or a new tier:

1. Adopt it promptly. Check the provider's model list and map the new model onto the tiers above by the provider's description.
2. Update defaults, pricing references and this guide in one change.
3. After a week of runs, compare the new model against the old one (speed, quota per task, failure rate, review findings) before calling it better.
