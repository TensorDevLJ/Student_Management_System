# ST_Management_Report — Frontend

Project: Frontend for ST_Management_Report — a web UI that displays and manages reports for the ST Management system.

## Overview
Single-page application that consumes backend APIs to list, view, filter and export management reports, and provide basic CRUD operations for report metadata.

## Key features
- Report listing and detail views
- Filtering, sorting and pagination
- CSV / PDF export
- Authentication hooks (token-based)
- Responsive UI for desktop and tablet

## Tech stack
- Framework: React (or Vue/Angular — replace as appropriate)
- Build: Vite / Create React App / Webpack
- Language: TypeScript (recommended) or JavaScript
- Styling: CSS modules / Tailwind / SASS
- Package manager: npm or yarn

## Prerequisites
- Node.js >= 16
- npm or yarn
- A running backend API and .env values (API_BASE_URL, AUTH settings)

## Local setup
1. Clone repository
2. Copy environment example:
    - cp .env.example .env
    - Edit .env to point to backend
3. Install:
    - npm install
    - or yarn
4. Run dev server:
    - npm run dev
    - or yarn dev
5. Build for production:
    - npm run build

## Common scripts
- dev: start dev server
- build: production build
- lint: run linter
- test: run unit tests
- preview: preview production build locally

## Project structure (example)
- src/
  - assets/
  - components/
  - pages/
  - services/ (API clients)
  - store/ (state management)
  - utils/
  - App.tsx
- public/
- package.json
- .env.example

## Environment
Add API endpoint and auth config in .env:
- VITE_API_BASE_URL=
- VITE_AUTH_CLIENT_ID=

## Contributing
- Follow code style and lint rules
- Open PRs against `develop` branch
- Include unit tests for new logic

## License
Add project license in LICENSE file (e.g., MIT)

Replace placeholders above with concrete choices (framework, commands, env keys) used in this repo.