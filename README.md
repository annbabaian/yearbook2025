# SIL Insurance Yearbook 2026 — GitHub Pages flipbook

Static interactive flipbook for the SIL Insurance 2026 Yearbook.

## Publish on GitHub Pages

1. Create a new GitHub repository (for example `sil-yearbook-2026`).
2. Upload **all files and folders from this project root**.
3. In GitHub open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then Save.
6. GitHub will give you a public URL such as `https://USERNAME.github.io/sil-yearbook-2026/`.

## Important

The flip animation uses the PageFlip browser library loaded from jsDelivr CDN. The Yearbook page images and PDF are stored locally in this repository.

### Requested page order

The viewer uses this custom sequence around pages 37–40:

`... 36, 38, 39, 40, 37, 41, 42, 43`

The sequence is controlled by `PAGE_ORDER` near the top of `app.js`, so it is easy to adjust later.

## SIL website

The same project can later be hosted under a path such as `https://silinsurance.am/yearbook/` by copying the files to that directory on the SIL web server.
