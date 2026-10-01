---
name: score-zoning-code
description: Grade a zoning code with ZoneCo's Equitable Zoning Scorecard and produce the results report (PDF) for the person who requested it. Use when Sean or a ZoneCo staff member asks to score, grade, or run the scorecard on a zoning code, or hands over a scorecard sign-up (name, email, jurisdiction, code PDF or link).
---

# Score a zoning code (Equitable Zoning Scorecard)

Sign-ups arrive through the "scorecard" form on `equity-scorecard.html` (Netlify Forms). Staff bring the
submission into a session: the requester's name, email, title/organization, jurisdiction, state, any notes,
and the code as an attached PDF or a link. This skill turns that into a report they can email.

The person in the session is usually Sean (see CLAUDE.md): talk plainly, no technical vocabulary.

## 1. Get the code text
- PDF: extract text page by page with pypdfium2 (`pip install pypdfium2` if missing), marking `=== PAGE n`.
  Use tables, not just prose. Text extraction scrambles use tables and dimensional tables: render those pages
  to PNG (pypdfium2 `page.render(scale=2).to_pil()`) and read the cells from the images.
- Link: download it. If the session cannot reach the site, say so and ask for the PDF instead.
- If the document is clearly not a zoning code, or is missing the use table or dimensional standards, stop and tell staff.

## 2. Grade it
Apply `rubric.md` (in this folder) exactly. It is ZoneCo's confidential method: never publish it, never commit
results or requester details to the repository, and keep working files in the scratchpad.
- Build a zone inventory first and classify every base zone as residential, commercial/mixed-use, or other
  (agricultural, industrial, institutional, parks, planned development are "other").
- Decide every line 1a through 15 true/false, with evidence: section, page, and a short verbatim quote (25 words max).
- Note confidence for each line. Any line that is a judgment call, or a place where the rules do not settle the
  question, goes on a list for staff. Do not guess silently.
- For long codes, a subagent per code (or per half of the categories) is fine; give it rubric.md and the text file.

## 3. Build the report
- Copy `scorecard-report-sample.html` from the repository root into a scratchpad folder, together with the
  `assets/` it uses (css/site.css, the fonts, img/logo.png, img/logo-tagline-dark-transparent.png, img/favicon.svg)
  so the copy renders on its own.
- Replace the `REPORT` object only: `sample:false`, `banner:""` (or e.g. "Draft for ZoneCo review" while staff
  check it), name, jurisdiction, document title, date, all 15 categories (`lines` = every line that scored,
  each with `pts`, `text` in plain English, `cite`, `quote`; categories scoring 0 get a `note` and `cite`
  explaining why), and three `opportunities` (largest gains first, each with how many points it could add).
- Write findings for a planning director or elected official: plain, specific, no jargon, no rubric line numbers.
- Render with Playwright (Chromium is at /opt/pw-browsers/chromium) to a Letter PDF with backgrounds on,
  and screenshot page 1 to check it. Check that the total, the band, and every category subtotal are right.

## 4. Hand it back
Send staff the PDF and a short summary: total, band, the three biggest findings, and the list of judgment calls.
The report goes to the requester only after staff have reviewed it. ZoneCo does not publish a community's score.
