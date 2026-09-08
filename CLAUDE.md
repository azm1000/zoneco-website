# Working in this folder

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
