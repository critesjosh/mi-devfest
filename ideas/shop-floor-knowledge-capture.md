---
tags:
  - project
  - hackathon
status: exploring
origin: ai-assisted
review_status: unreviewed
created: 2026-11-13
---

# Shop floor knowledge capture

Hackathon project idea: capture what retiring skilled workers know before they leave, and turn it into guides apprentices can use on the shop floor. Target track: Manufacturing (or Workforce). Stack: IBM (Docling, speech-to-text, Granite on watsonx.ai, optionally watsonx.governance).

**Pitch hook (draft):** "Michigan built the auto industry on know-how. Most of it was never written down." The second sentence is a claim, not a sourced stat. Say it as ours.

## Problem

Experienced trades workers are retiring, and most of what they know about specific machines, parts, and fixes isn't written down anywhere. Shops find out what was lost after the person is gone.

### The numbers

**National**
- 25.2% of US manufacturing workers are 55 or older (3.82M of 15.13M), vs 23.2% across all industries. ([BLS CPS table 18b, 2025](https://www.bls.gov/cps/cpsaat18b.htm))
- In machine shops (BLS category "machine shops; turned product; screw, nut, and bolt"), 31.6% are 55+ and the median age is 46.9. (same table)
- Industrial machinery mechanics: 27.7% are 55+. Machinists: about 31%. ([BLS CPS table 11b](https://www.bls.gov/cps/cpsaat11b.htm); confirm the machinist row before citing, since its label didn't come through in extraction)
- US manufacturing may need 3.8M workers in 2024–2033. **2.8M of those openings come from retirements.** Up to 1.9M could go unfilled (a projection, from an industry-funded study). ([Deloitte & The Manufacturing Institute, 2024](https://themanufacturinginstitute.org/wp-content/uploads/2024/04/Digital_Skills_Report_April_2024.pdf))

**Michigan**
- About 583,000 manufacturing workers, more than 1 in 8 non-farm jobs. ([LEO, Oct 2026](https://www.michigan.gov/leo/news/2026/10/05/michigan-manufacturing-industry-fuels-career-and-economic-growth))
- Manufacturing's share of workers aged 45–64 is about 8 points higher than the state as a whole. ([MCDA 2026 manufacturing report, demographics](https://www.michigan.gov/mcda/labor-market-information/2026-michigan-manufacturing-industry-workforce-analysis-report/workforce-demographics))
- Several trade jobs are projected to shrink, yet still have steady openings. Those openings are mostly replacements, and each one is a knowledge handoff. ([MCDA key occupations, 2024–2034 projections](https://www.michigan.gov/mcda/labor-market-information/2026-michigan-manufacturing-industry-workforce-analysis-report/key-occupations))

| Occupation | Employed in MI manufacturing | Projected growth | Annual openings |
| --- | --- | --- | --- |
| Machinists | 17,840 | −5.8% | 2,040 |
| Tool and die makers | 8,820 | −18.5% | 660 |
| Industrial machinery mechanics | 11,810 | +13.0% | 1,900 |

- No Michigan-specific "% aged 55+" figure was found. "Roughly 1 in 4" is a fair national figure. Don't present an extrapolated Michigan count as sourced.

**Framing:** the data supports "every retirement is a knowledge handoff, and most shops have no system for it" better than "worker shortage." Michigan projects many of these jobs to shrink.

### Stories

- **FOGBANK (US nuclear weapons program).** The GAO found that NNSA "kept few records of the process when the material was made in the 1980s and almost all staff with expertise on production had retired or left the agency." Result: a one-year delay and $69M extra cost. ([GAO-09-385](https://www.gao.gov/assets/a286696.html)) NNSA disputes that it "forgot" the process, saying lost staff "complicated" rebuilding it. ([NNSA FAQ](https://armscontrolcenter.org/nnsa-faq-on-fogbank)) Use as illustration, not as a factory story.
- **Michigan plant (vendor anecdote).** One person could run a finicky line. When he was out sick for weeks, the company "had to fly in the OEM from Europe," a six-figure bill. ([Specright](https://www.specright.com/blog/why-tribal-knowledge-is-the-biggest-threat-to-manufacturing); unverified, and from a vendor)
- **Industry quote.** "I guarantee you there isn't one product made on the planet that doesn't have two to five secret steps that are not in the documentation." Will Healy, Teradyne Robotics. ([A3 / Automate.org](https://www.automate.org/robotics/industry-insights/the-great-knowledge-transfer-safeguarding-manufacturing-expertise-as-veteran-workers-retire))
- **Machinists on Reddit.** After a retirement, a manager complained the retiree's departure "came out of no where," though he'd announced it two years earlier, and "it went on for 6 months straight." In the same thread, a 52-year-old journeyman tool and die maker: "there's no one learning under me." ([r/Machinists](https://www.reddit.com/r/Machinists/comments/1cg694b/lathe_hand_retired_yesterday))

### Avoid citing

Vendor stats with no traceable study: "70% of knowledge is undocumented," "$47M lost per year," "$2.3M lost when machinist Michael Torres retired" (24G blog; reads as a made-up example), and vendor "customer results" percentages.

## Proposed solution

A veteran worker talks through a job: setting up a machine, fixing a common defect, a check they always do. The tool combines those recordings with the shop's existing work instructions and manuals and produces step-by-step guides. Apprentices ask questions on their phone and get answers that cite the veteran's own words.

### Demo loop

1. **Interview.** The veteran talks through a setup. The AI asks two or three follow-up questions ("What are you looking for when you check the fixture?" "What goes wrong when someone new does this?").
2. **Gap check.** The tool compares the interview against the written work instruction and flags differences ("The manual never mentions shimming the vise"). This is the "aha" moment.
3. **Veteran sign-off.** The AI drafts a guide, and the veteran approves or corrects it with one tap.
4. **Apprentice Q&A.** The apprentice asks a question and gets an answer with a playable clip of the veteran explaining it.

### IBM stack

- **Docling:** read manuals and work instructions
- **Speech-to-text:** transcribe interviews
- **Granite on watsonx.ai:** follow-up questions, gap check, guide drafting, Q&A
- **watsonx.governance (optional):** show answers trace back to approved sources

### Demo data

Write one realistic work instruction and record a 3-minute mock interview. Don't spend hackathon time hunting for real factory documents.

## Unique value

### Why not a dictation app plus NotebookLM?

That setup handles transcription and Q&A with citations, about 70% of the way. It captures whatever the veteran thinks to say. It misses:

- **The steps that feel obvious to the veteran.** These are the ones they skip and an apprentice needs. A tool that asks follow-ups and checks against the written instruction catches them.
- **Veteran sign-off.** Generic chat tools have no review step. On a shop floor, a confident wrong answer means scrap or an injury.
- **Structure.** Knowledge tied to a machine, part number, and job, not buried in "interview_march_3.m4a."
- **Shop-floor use.** Phone, gloves, noise, spotty Wi-Fi.
- **Data control.** Small suppliers work under OEM confidentiality and sometimes ITAR. Many can't upload customer process details to a consumer AI tool. (Present this as a concern shops have. We haven't checked each tool's data policy.)

**One-liner:** "Dictation captures what the veteran thinks to say. We capture what they forget to say, and they sign off on it."

### Why not existing knowledge-capture products?

Companies already sell versions of this: Manual.to, Poka, Covalent, Dovient, Augmentir, Dirac, plus consultancies like [WiscAI](https://wiscai.com/ai-knowledge-capture-before-retirement) and [Eurokommerz](https://eurokommerz.at/blog/capturing-expert-knowledge-before-retirement). That proves demand. It also means "AI turns expert knowledge into guides" isn't new on its own. Where we differ:

1. **The interviewer finds gaps.** Most products film or transcribe, then summarize. We ask follow-ups and compare against the written instruction to surface the "secret steps."
2. **Built for small job shops.** Most tools target large plants with training departments. A 30-person Michigan shop has no one to run a documentation program. The veteran only has to talk.
3. **The veteran gets credit.** Answers play back in the veteran's own voice, with their name on it. This frames capture as a legacy, not training a replacement, which matters for getting veterans to take part.
4. **Answers trace back to sources.** Every answer cites an approved guide and a timestamp in the recording.

Eurokommerz describes a design close to ours (interviews at the machine, expert approves each note, answers cite the recording minute). Read it before the pitch so we can say clearly how we differ.

## Evidence the approach works

- **AI spreads expert know-how to novices.** An AI assistant raised customer support productivity 14% on average and 34% for novices, with little gain for experts. The authors found suggestive evidence it "disseminates the best practices of more able workers." ([Brynjolfsson, Li & Raymond, *Generative AI at Work*, QJE 2025](https://www.nber.org/papers/w31161)) This was a call center, not a factory.
- **Writing down expert jobs worked before.** The WWII Training Within Industry program broke skilled jobs into teachable steps. By September 1945, 100% of plants reporting on training time said it dropped 25% or more. ([TWI Report 1940–1945](https://www.govinfo.gov/content/pkg/GOVPUB-PR32_5200-00275cf1fd80a1d51995ae716fd38f34/pdf/GOVPUB-PR32_5200-00275cf1fd80a1d51995ae716fd38f34.pdf); plants reported these figures themselves) Our tool is TWI Job Instruction with AI doing the writing.

## Scoring fit

| Criterion | Why it scores |
| --- | --- |
| Completeness | Small, demo-able loop: interview → gap check → guide → Q&A with citations |
| Creativity | Most factory AI works with sensor data. This captures what's in people's heads. |
| Design | Apprentice uses a phone on the floor. Veteran only has to talk. |
| Effectiveness | Measurable: time to productivity for new hires, repeated mistakes, downtime |
| Michigan impact | About 2,000 machinist openings a year in Michigan, nearly all replacements |

## Suggested pitch evidence order

1. **Scale:** about 2,000 Michigan machinist openings a year, almost all replacements.
2. **Story:** the retiree who gave two years' notice, and the shop still lost six months.
3. **Why it works:** AI lifted novices 34% by spreading what experts knew.
4. **Precedent:** WWII plants that wrote down expert jobs all cut training time 25% or more.

## Open questions

- Which hackathon, date, and track rules?
- Runner-up idea: a tool to help small Michigan suppliers answer OEM requests for quotes. Strong local story, but realistic demo data is harder.
- Next: architecture sketch and 3-minute pitch.
