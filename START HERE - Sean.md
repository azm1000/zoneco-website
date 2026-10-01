# ZoneCo new website: how to work on it yourself

This folder is the complete new website. There is nothing to install and nothing to compile. Double-click `index.html` and the whole site opens in your browser, straight from this folder.

## Why Claude gave you errors before

The link Josh sent you was one giant preview file with the whole site squeezed into it. There was nothing in it Claude could actually edit, so it complained about missing files. This folder is the real thing: 43 separate pages, one stylesheet, and the images. Claude can work with this.

## What you need

Use the **Claude desktop app** (not the chat window in a browser), because the desktop app can be pointed at a folder on your computer and will edit the files in place. Install it from claude.ai/download if you don't have it.

## Changing the logo (the quick way, 5 minutes)

The logo appears in the header and footer of every page, but it is one file: `assets/img/logo.png`. Change that file and all 45 pages change. (As of 9/8 it already carries the ZONECO wordmark from thezoneco.com; the steps below are for replacing it with your original artwork.)

1. Unzip this folder somewhere easy to find (your Desktop is fine). Keep the folder name simple, e.g. `ZoneCo Website`.
2. Open the Claude desktop app, start a new Cowork task, and click **Add folder**. Choose the `ZoneCo Website` folder.
3. Paste this:

   > Read START HERE - Sean.md and README.md in this folder. Replace the site logo with the ZoneCo wordmark in `brand-source/ZoneCo_Logo_Reversed-noTag (cropped from web version).png` (the ZONECO wordmark with the four colored plus signs). Update the header and footer on every page and the browser-tab icon, keep the header the same height, and tell me which files you changed.

4. When Claude says it's done, double-click `index.html` and look at the header and the footer. Click into a few other pages. If something looks off, tell Claude what you see ("logo is too small", "it's cut off on the left") and it will adjust.

## The better way: give Claude the original logo files

The copy of the logo in `brand-source/` was pulled from thezoneco.com. It is only the white-on-dark version and only as a flattened image, which is fine for this site (the header and footer are both dark) but it isn't the real thing.

If you have the files your designer delivered (an `.ai`, `.eps`, `.pdf`, or `.svg` version of the logo, ideally both the standard and reversed/white versions, plus a brand guide or the exact color values), drop them into the `brand-source/` folder before step 3 and change the prompt to:

   > Read START HERE - Sean.md and README.md. The original ZoneCo logo files are in brand-source/. Use the reversed (white) version for the header and footer on every page, make a matching browser-tab icon, and if the brand guide lists colors, tell me how they differ from the site's current palette before changing anything else.

Vector files (`.ai`, `.eps`, `.pdf`, `.svg`) are the ones you want; they stay sharp at any size. A `.png` or `.jpg` works too if it is large (2,000 pixels wide or more) and has a transparent background.

## Matching the rest of the branding (colors, fonts)

The site's colors are set in one place at the top of `assets/css/site.css` (a short list: ink, paper, ochre, slate, sage, brick). The font is Libre Franklin. If you want the new site to use ZoneCo's brand colors instead, tell Claude: "Update the site's color palette in assets/css/site.css to ZoneCo's brand colors: [paste the hex values, or point it at the brand guide in brand-source/]." Ask it to show you a before/after on `index.html` and `about.html` before it touches every page.

## Things to know

- **Nothing you do here is live.** This is a copy on your computer. Nothing changes on thezoneco.com until someone deploys this folder (see README.md).
- **Keep a backup.** Before a big change, duplicate the folder (right-click, Duplicate). If Claude makes a mess, throw the copy away.
- **The PDF library is included** (`assets/docs`, the 21 reports and historical documents the old site hosted; it is most of the folder's size). Links to them work from your computer and once deployed.
- **The hero video is stock footage** (Mixkit), meant to be replaced with ZoneCo footage.

Questions: Josh.
