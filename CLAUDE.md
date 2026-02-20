# CLAUDE.md — AI Assistant Guide for AY (Ay Website)

## Project Overview

**AY** is the website for **GC Premier Property Group** — a premium real estate firm. Built with Next.js (App Router) and Tailwind CSS. The site is a single-page marketing site with sections for About, Services, and Contact.

## Repository Structure

```
AY/
├── src/
│   └── app/
│       ├── layout.tsx      # Root layout (metadata, fonts, global styles)
│       ├── page.tsx         # Homepage (hero, about, services, contact, footer)
│       └── globals.css      # Global styles and Tailwind imports
├── public/                  # Static assets (images, favicons)
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── next.config.ts           # Next.js configuration
├── postcss.config.mjs       # PostCSS config (Tailwind plugin)
├── eslint.config.mjs        # ESLint configuration
├── README.md                # Project description
└── CLAUDE.md                # This file — AI assistant guide
```

## Branch & Git Conventions

- **Default branch:** `main`
- **Feature branches:** Use descriptive names prefixed by category, e.g., `feature/add-contact-form`, `fix/nav-responsive`
- Write clear, concise commit messages that describe *why* a change was made
- Keep commits focused — one logical change per commit
- Push feature branches and open pull requests for review before merging to `main`

## Development Workflow

### Getting Started

```bash
git clone <repo-url>
cd AY
npm install
```

### Running Locally

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
npm start        # serve the production build
```

### Linting

```bash
npm run lint
```

Uses ESLint with `eslint-config-next`.

### Running Tests

> Not yet configured. Add a test framework (e.g., Jest, Vitest) and document the command here.

## Tech Stack

| Layer       | Technology                       |
|-------------|----------------------------------|
| Framework   | Next.js 16 (App Router)          |
| Language    | TypeScript                       |
| Styling     | Tailwind CSS 4                   |
| UI Library  | React 19                         |
| Linting     | ESLint with eslint-config-next   |
| Package Mgr | npm                              |

## Coding Conventions

- **Language:** TypeScript for all source files
- **Linting:** ESLint with `eslint-config-next`
- **Naming:**
  - Files/folders: `kebab-case` (e.g., `contact-form.tsx`)
  - Components: `PascalCase` (e.g., `ContactForm`)
  - Variables/functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
- **Imports:** Group and order — external packages first, then internal modules, then relative imports
- **Styling:** Use Tailwind utility classes directly in JSX. Avoid separate CSS files unless necessary for global styles.
- **No secrets in code:** Use environment variables (`.env.local`) for API keys, credentials, and sensitive values. Never commit `.env` files.

## AI Assistant Guidelines

When working in this repository, AI assistants should:

1. **Read before writing.** Always read existing files before proposing changes.
2. **Keep changes minimal.** Only modify what is directly requested. Avoid unnecessary refactors or feature additions.
3. **Follow existing patterns.** Match the style, naming, and structure already present in the codebase.
4. **Do not introduce secrets.** Never hardcode API keys, passwords, or credentials.
5. **Test your changes.** Run `npm run lint` and `npm run build` before considering work complete.
6. **Update this file.** When adding significant infrastructure (new framework, test setup, CI pipeline), update the relevant sections of this CLAUDE.md.
7. **Commit thoughtfully.** Use descriptive commit messages and avoid bundling unrelated changes.

## CI/CD

> Not yet configured. Update this section when a CI pipeline (GitHub Actions, etc.) is added.

## Environment Variables

> No environment variables are required yet. Document them here as they are introduced:
>
> | Variable | Description | Required |
> |----------|-------------|----------|
> | — | — | — |

## Useful Commands Reference

| Command         | Description                  |
|-----------------|------------------------------|
| `npm install`   | Install dependencies         |
| `npm run dev`   | Start development server     |
| `npm run build` | Production build             |
| `npm start`     | Serve production build       |
| `npm run lint`  | Run ESLint                   |
