# Resync — Website Repository

Official repository for the **Resync** company website.

## For developers

**Read this document before writing any code:**

👉 **[WEBSITE_DEVELOPER_GUIDE.md](./WEBSITE_DEVELOPER_GUIDE.md)**

That file contains the complete specification:

- Design reference ([Diagonkixa](https://diagonkixa.com))
- Every page section with exact copy placeholders
- Component list, file structure, and tech stack
- Forms, API stubs, responsive rules, SEO, and deployment
- Deliverables and acceptance criteria

## Quick summary

| Item | Detail |
|---|---|
| What | Marketing website for an AI research company (agriculture + healthcare) |
| Layout | Single-page scroll + `/apply` page |
| Reference | [diagonkixa.com](https://diagonkixa.com) — clone structure, Resync branding |
| Stack | Next.js (App Router) + TypeScript + Tailwind CSS |
| Deploy | Vercel |
| Scope | Front-end only — no auth, payments, or LMS |

## Setup (after code is added)

```bash
git clone https://github.com/ansulx/Resync.git
cd Resync
npm install
npm run dev
```

## Questions

Refer to the guide first. If something is not covered in `WEBSITE_DEVELOPER_GUIDE.md`, open a GitHub issue in this repo.
