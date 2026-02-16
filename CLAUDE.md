# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **static personal website** for Dr. Kalyan Vangara, a Surgical Oncologist in Hyderabad, India. It is deployed via **GitHub Pages** from the `main` branch of `OmPrakashV/Kalyan`. The site is a single-page application with no build step — all files are served directly.

## Architecture

The entire site is three files:

- **index.html** — Single-page layout with sections: Hero, About, Services, Blog, Testimonials, Media (YouTube + Instagram), Contact. Includes JSON-LD structured data for SEO (`@type: Physician`), Open Graph/Twitter Card meta tags, and a WIP banner at the top.
- **styles.css** — "Clinical Serenity" theme using CSS custom properties in `:root`. Fonts: Cormorant Garamond (display) + Work Sans (body) loaded from Google Fonts. Responsive with mobile breakpoints.
- **script.js** — Vanilla JS, no framework or bundler. Initializes critical systems (nav, scroll effects, modal) on DOMContentLoaded, then defers non-critical systems (blog, feedback, contact, YouTube, Instagram) via `requestIdleCallback`.

Supporting files: `photo.jpeg` (hero image), `favicon.svg`, `kalyan_resume.md` (source CV data), `.nojekyll` (disables Jekyll processing on GitHub Pages).

## Key Systems in script.js

- **Blog System**: Dynamic blog cards stored in `localStorage`, static cards use `data-blog-title`/`data-blog-content` attributes opened in a modal.
- **Feedback/Testimonials**: Form submissions saved to `localStorage`, displayed with consent check. Patient initials shown (not full names).
- **Contact Form**: Builds a WhatsApp message and opens `wa.me/919966003251` — no backend server.
- **YouTube Feed**: Fetches RSS via CORS proxy (`api.allorigins.win`). **Channel ID is currently placeholder** (`YOUR_CHANNEL_ID`) — needs to be replaced with the actual UC... ID for `@ABCcancer`.
- **Instagram Embeds**: Script loaded lazily when media section enters viewport.
- **Admin Console Functions**: `viewStoredData()` and `clearAllData()` available in browser console.

## Deployment

Commits to `main` auto-deploy to GitHub Pages. Commit messages follow the pattern: `deploy: OmPrakashV/KalyanWeb@<hash>` (deployed from a separate source repo `KalyanWeb`).

No build, test, lint, or compilation commands exist. To preview locally, open `index.html` in a browser (or use any static file server).

## NMC Compliance Rules

All content must comply with India's National Medical Commission guidelines:
- No superlatives ("best", "leading", "top")
- No outcome guarantees
- Patient testimonials require explicit consent
- No inducements or referral bonuses
- Maintain patient confidentiality
