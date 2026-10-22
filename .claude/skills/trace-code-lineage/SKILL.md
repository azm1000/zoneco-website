---
name: trace-code-lineage
description: Compare a zoning code with New York City's 1916 Building Zone Resolution and produce ZoneCo's Code Lineage Report (PDF) for the person who requested it. Use when Sean or a ZoneCo staff member asks to run the lineage tool, trace a code's lineage, or compare a code to New York 1916, or hands over a Code Lineage sign-up (name, email, jurisdiction, code PDF or link).
---

# Trace a zoning code's lineage (Code Lineage Report)

Requests arrive through the "lineage" form on `code-lineage.html` (Netlify Forms). Staff bring the
submission into a session: the requester's name, email, title/organization, jurisdiction, state, which code
(year or "current"), any notes, and the code as an attached PDF or a link. This skill turns that into a
report they can email.

The person in the session is usually Sean (see CLAUDE.md): talk plainly, no technical vocabulary.

## 1. Get the code text
- PDF: extract text page by page with pypdfium2 (`pip install pypdfium2` if missing), marking `=== PAGE n`.
  Scanned pages (historic ordinances, newspaper legal notices) have no text layer: render them to PNG
  (pypdfium2 `page.render(scale=2).to_pil()`) and read them column by column. Never invent wording; mark
  illegible words [illegible].
- Link: download it. If the session cannot reach the site, say so and ask for the PDF instead.
- If the document is clearly not a zoning code, stop and tell staff.

## 2. Compare it
The seventeen hallmarks, their weights and the four verdicts are fixed. They are the `GROUPS`, `MARKERS`
and `VERDICTS` objects in `lineage-report-sample.html` (the same ones the public comparison on
`resources.html` uses). Do not change them per report.

For each hallmark m1-m17 decide a verdict, with evidence:
- **copied**: carried over nearly intact, often in close wording.
- **adapted**: same idea, changed numbers or mechanics.
- **replaced**: the topic is handled by a different, non-New York device.
- **absent**: not addressed.

Rules:
- Judge only from the code text and the 1916 Resolution. Where unsure what New York's exact wording was,
  prefer "adapted" over "copied" and say so in the note.
- `ev` is an exact quotation from the code, under 30 words, cleaned of obvious scanning noise, or "" when
  nothing applies. Never invent a quotation. `sec` is the section (e.g. "Sec. 4" or "§ 1105.02").
  `note` is one or two plain sentences on what was kept or changed, with the code's numbers.
- `departures`: up to six significant provisions with no counterpart in 1916 (lot coverage percentages,
  density per acre, front building lines, single-family-only districts, minimum lot sizes, parking
  minimums, form-based standards). Same fields.
- `summary`: three to five sentences for a planning audience: what was borrowed, what was dropped, what was added.
- `lineage`: one to three sentences on likely intermediate sources (the Standard State Zoning Enabling Act,
  state model ordinances, consultants such as Bartholomew or Bassett), framed as hypotheses, never as fact.
- Modern codes: most of the height-and-courts hallmarks will be replaced or absent, and the administrative
  ones (nonconforming uses, board of appeals, protest petition, minimum-requirements clause) often survive.
  That is a finding, not a problem; say so plainly.
- Keep a list for staff of every verdict that was a judgment call.

## 3. Build the report
- Copy `lineage-report-sample.html` from the repository root into a scratchpad folder, together with the
  `assets/` it uses (css/site.css, the fonts, img/logo.png, img/logo-tagline-dark-transparent.png,
  img/favicon.svg) so the copy renders on its own.
- Replace the `REPORT` object only: `sample:false`, `banner:""` (or "Draft for ZoneCo review" while staff
  check it), `name` (the requester, e.g. "Jordan Rivera, Planning Director"), `jurisdiction`, `year`,
  `title` (the ordinance's name or number), `adopted`, `document`, `date`, `summary`, all seventeen
  `findings`, `departures`, `lineage`.
- Render with Playwright (Chromium is at /opt/pw-browsers/chromium) to a Letter PDF with backgrounds on,
  and screenshot page 1 to check it. The percentage is computed by the page; check it reads sensibly
  against the findings.
- Never commit a requester's report or details to the repository; keep working files in the scratchpad.

## 4. Hand it back
Send staff the PDF and a short summary: the inheritance percentage, the three most interesting findings,
and the list of judgment calls. The report goes to the requester only after staff have reviewed it.
