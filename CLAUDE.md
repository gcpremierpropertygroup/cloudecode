# CLAUDE.md — AI Assistant Guide for AY (Ay Website)

## Project Overview

**AY** is the website for GC Premier Property Group. This repository is in its early stages (initialized with a README only). The sections below establish conventions and expectations for AI-assisted development as the codebase grows.

## Repository Structure

```
AY/
├── README.md          # Project description
└── CLAUDE.md          # This file — AI assistant guide
```

> As the project evolves, update this section to reflect the actual directory layout (e.g., `src/`, `public/`, `tests/`, config files).

## Branch & Git Conventions

- **Default branch:** `main`
- **Feature branches:** Use descriptive names prefixed by category, e.g., `feature/add-contact-form`, `fix/nav-responsive`
- Write clear, concise commit messages that describe *why* a change was made
- Keep commits focused — one logical change per commit
- Push feature branches and open pull requests for review before merging to `main`

## Development Workflow

### Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd AY

# Install dependencies (update this once a package manager is chosen)
# npm install   — if using npm
# yarn          — if using yarn
# pnpm install  — if using pnpm
```

### Running Locally

> Document the local dev server command here once the tech stack is established (e.g., `npm run dev`, `yarn start`).

### Building for Production

> Document the production build command here once configured (e.g., `npm run build`).

### Running Tests

> Document the test command here once a test framework is added (e.g., `npm test`, `npx jest`).

### Linting & Formatting

> Document linting/formatting commands here once configured (e.g., `npm run lint`, `npx prettier --check .`).

## Tech Stack

> **To be determined.** Update this section when the stack is chosen. Likely candidates for a property group website:
>
> - **Framework:** Next.js, Astro, or plain HTML/CSS/JS
> - **Styling:** Tailwind CSS, CSS Modules, or Sass
> - **CMS:** Headless CMS (e.g., Sanity, Contentful) or static content
> - **Hosting:** Vercel, Netlify, or similar

## Coding Conventions

The following conventions should be adopted as code is written:

- **Language:** Use TypeScript where possible for type safety (if a JS framework is chosen)
- **Formatting:** Use Prettier with consistent config across the team
- **Linting:** Use ESLint with a standard rule set (e.g., `eslint-config-next` for Next.js)
- **Naming:**
  - Files/folders: `kebab-case` (e.g., `contact-form.tsx`)
  - Components: `PascalCase` (e.g., `ContactForm`)
  - Variables/functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
- **Imports:** Group and order imports — external packages first, then internal modules, then relative imports
- **No secrets in code:** Use environment variables (`.env.local`) for API keys, credentials, and sensitive values. Never commit `.env` files.

## AI Assistant Guidelines

When working in this repository, AI assistants should:

1. **Read before writing.** Always read existing files before proposing changes.
2. **Keep changes minimal.** Only modify what is directly requested. Avoid unnecessary refactors or feature additions.
3. **Follow existing patterns.** Match the style, naming, and structure already present in the codebase.
4. **Do not introduce secrets.** Never hardcode API keys, passwords, or credentials.
5. **Test your changes.** Run any available linters, type checkers, and tests before considering work complete.
6. **Update this file.** When adding significant infrastructure (new framework, test setup, CI pipeline), update the relevant sections of this CLAUDE.md to keep it current.
7. **Commit thoughtfully.** Use descriptive commit messages and avoid bundling unrelated changes.

## CI/CD

> Not yet configured. Update this section when a CI pipeline (GitHub Actions, etc.) is added. Document:
> - Which checks run on PRs (lint, test, build)
> - Deployment targets and triggers
> - Required status checks before merge

## Environment Variables

> Document required environment variables here as they are introduced. Example format:
>
> | Variable | Description | Required |
> |----------|-------------|----------|
> | `NEXT_PUBLIC_SITE_URL` | Public site URL | Yes |
> | `CMS_API_KEY` | CMS access token | Yes |

## Useful Commands Reference

> Populate this table as the project tooling is set up:
>
> | Command | Description |
> |---------|-------------|
> | `npm run dev` | Start development server |
> | `npm run build` | Production build |
> | `npm test` | Run test suite |
> | `npm run lint` | Run linter |
