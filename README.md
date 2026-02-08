# dAdvisor — UC Davis Major Transfer Planner

A web app to help **UC Davis undergraduates** plan a major change: see requirements for a target major, mark completed courses, plan quarters, and estimate how long it will take to graduate in the new major.

## Features

- **Choose majors** — Select your current major and the major you want to switch into.
- **View requirements** — See all required courses for the target major, with checkmarks for what you’ve completed.
- **Mark completed courses** — Check off courses you’ve already passed so the app knows what’s left.
- **Plan quarters** — Assign remaining courses to quarters and pick a start quarter.
- **Time estimate** — Get an estimate of remaining courses, units, quarters, and an approximate completion term.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL shown (e.g. http://localhost:5173).

## Build

```bash
npm run build
```

Output is in `dist/`.

## Data (majors & courses)

The app uses **seed data** for a small set of UC Davis–style majors and courses:

- **Majors:** Computer Science (BS), Economics (BA), Psychology (BA), Biological Sciences (BS), Communication (BA).
- **Courses:** Realistic course codes (e.g. ECS 036A, ECN 100, PSY 001) and prerequisite links.

To add more majors or courses:

1. **Courses** — Edit `src/data/courses.ts` (add to the `courses` array).
2. **Majors** — Edit `src/data/majors.ts` (add a new major and reference course IDs from `courses`).

Official, up-to-date requirements are in the [UC Davis General Catalog](https://catalog.ucdavis.edu/departments-programs-degrees/). This app is **not** a substitute for advising; students should confirm with their college advisor and the [Change of Major](https://oasis.ucdavis.edu/forms/instructions/changeofmajor.aspx) process.

## Tech stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** (v4) for styling
- No backend; all state is in the browser for the moment 

## Disclaimer

This project is not affiliated with UC Davis. Requirements and course codes are illustrative; always verify with the university catalog and your advisor.
