# Working in this repository

## Who you are working with

This site belongs to ZoneCo. Its owner, Sean Suder, is a zoning lawyer, not a developer, and he will ask for changes in plain English ("make the logo bigger," "add a news item about Powell," "Todd's title is wrong"). Josh Bernstein (of counsel) set the site up and handles anything technical. When the person in the session is Sean, or you are not sure who it is:

- Talk like a web designer talking to a client. No git, branch, commit, PR, HTML, or CSS vocabulary unless he asks. Never ask him to pick a file name, a branch, or a path.
- Make the change, check it by rendering the page (a screenshot of the affected area is ideal), and describe what you changed in one or two plain sentences.
- Then publish it for review: push to a new branch and open a pull request titled in plain English (e.g. "Team page: Todd's title") with a one-paragraph description. Netlify posts a "Deploy Preview" link on the pull request within a minute. Tell him: open the pull request link, click the Deploy Preview to see the change on the real site, and if it looks right click **Merge pull request** then **Confirm merge**. The live site updates about ten seconds after that.
- If a request is ambiguous, make the most reasonable choice and say what you assumed, rather than asking three questions. Ask only when the choice is one he would care about (which photo, which wording).
- Keep changes minimal and local. Don't restructure pages, rename files, reformat HTML, change fonts, or "improve" things he didn't ask about.
- If he uploads a logo or photo in the chat, save it under `assets/img/` with a new descriptive file name and reference it; don't overwrite existing images (see cache rule below).
- Anything that needs Josh (hosting, domain, forms, something that looks broken for a technical reason): say so plainly and suggest he email Josh, rather than attempting infrastructure changes.


This is ZoneCo's new static website: 43 flat HTML pages at the root, one stylesheet (`assets/css/site.css`), two scripts, self-hosted fonts and images. There is no build step and no generator here; edit the HTML/CSS/asset files directly. The site opens from disk (`index.html`), so verify changes by rendering pages, not just by reading the diff.

Read `README.md` before making changes; it documents the logo mechanism, the color variables, and the deploy setup. `START HERE - Sean.md` is the owner's plain-English guide and describes what he is likely asking for.

## Logo swaps

- The logo is one file, `assets/img/logo.png` (ZONECO ++++ wordmark, white), shown at `--logo-height` (32px) in the header and footer of every page. Replace the file rather than editing 43 pages. If the replacement is an SVG, name it `logo.svg` and update the `src` on every page with a scripted find-and-replace, never by hand.
- Header and footer are dark. Use the reversed/white logo. Trim transparent margins. Wordmarks with a tagline need either the no-tagline version or a larger `--logo-height` (max ~40px).
- Also replace `assets/img/favicon.svg` with a square version of the new mark.
- Raw logo files live in `brand-source/` (web pull from thezoneco.com, plus any originals the owner adds). Prefer vector originals (`.ai`, `.eps`, `.pdf`, `.svg`) over the web PNG; convert to SVG or a large transparent PNG as needed.
- After a swap, render `index.html`, `about.html`, and `contact.html` (header at top, footer at bottom) and report what changed.

## Site-wide edits

Header and footer markup is duplicated verbatim in all 43 `*.html` files. Any change to them must be applied to every file with a script, and the count of replacements should equal 43 (or 86 for elements that appear in both header and footer). Assert that before saving.

## Cache busting

Assets are served with a one-year immutable cache (netlify.toml). After editing `assets/css/site.css`, `assets/js/site.js`, or `assets/js/map.js`, change the `?v=` value on their tags in every page (scripted replace across `*.html`, assert 43). Give changed images new file names rather than overwriting.

## Do not

- Do not touch `_redirects`, `netlify.toml`, `sitemap.xml`, or `robots.txt` for branding work.
- Do not resize or recompress photos in `assets/img/` unless asked.
- Do not deploy anything; this folder is a local copy.
