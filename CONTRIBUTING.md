# Contributing to FindThaGame

First off, thank you for considering contributing to **FindThaGame**! 🎉 

FindThaGame is an open-source tool designed to help people rediscover forgotten video games through fuzzy query matching, smart scoring heuristics, and AI summaries.

Whether you're fixing a bug, suggesting a feature, improving documentation, or adding support for new game filters, your contributions are warmly welcomed.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). Please report unacceptable behavior to [cebemind@hotmail.com](mailto:cebemind@hotmail.com).

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- A [Twitch Developer](https://dev.twitch.tv/console/apps) account (to generate IGDB API credentials)
- *(Optional)* A [Groq Cloud](https://console.groq.com/) API key (for game AI summaries and translations)

### Local Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/findthagame.git
   cd findthagame
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the project root:
   ```env
   TWITCH_CLIENT_ID=your_twitch_client_id
   TWITCH_CLIENT_SECRET=your_twitch_client_secret
   AI_API_KEY=your_groq_api_key
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How to Contribute

### 1. Reporting Bugs

Before creating a bug report, please check existing [Issues](https://github.com/kbtale/findthagame/issues) to avoid duplicates.

When submitting a bug report:
- Use our [Bug Report Template](https://github.com/kbtale/findthagame/issues/new?template=bug_report.yml).
- Include clear, step-by-step instructions to reproduce the issue.
- Provide details about your browser, operating system, and any console error messages.

### 2. Suggesting Enhancements & Features

Feature ideas are always welcome!
- Use our [Feature Request Template](https://github.com/kbtale/findthagame/issues/new?template=feature_request.yml).
- Describe the problem your feature solves and how it fits into the game discovery workflow.
- Detail any potential alternatives or trade-offs.

### 3. Submitting Pull Requests

1. **Create a branch:**
   Use a descriptive branch name prefix:
   - `feat/` for new features (e.g., `feat/add-multi-genre-filter`)
   - `fix/` for bug fixes (e.g., `fix/scoring-multiplier-edge-case`)
   - `docs/` for documentation updates
   - `chore/` for tooling or dependency maintenance

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes:**
   - Follow clean, readable TypeScript and React coding practices.
   - Keep styling consistent with Tailwind CSS and Radix UI / Shadcn conventions.

3. **Run quality checks locally:**
   Make sure linting and building pass without errors:
   ```bash
   npm run lint
   npm run build
   ```

4. **Commit your changes:**
   Use clear, conventional commit messages:
   ```bash
   git commit -m "feat: add platform-specific filter badge"
   ```

5. **Push and open a Pull Request:**
   ```bash
   git push origin feat/your-feature-name
   ```
   - Open a PR against the `main` branch of `kbtale/findthagame`.
   - Fill out the provided [Pull Request Template](./.github/pull_request_template.md).
   - Link any related issues (e.g., `Closes #12`).

---

## Project Architecture Overview

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + TanStack Router
- **UI Components**: Radix UI primitives & Shadcn UI components in `src/components/ui/`
- **State Management**: Redux Toolkit in `src/store/`
- **Search & Scoring**:
  - `src/lib/igdb.ts`: IGDB API requests, multi-query execution, and token caching.
  - `src/lib/scoring.ts`: Hybrid relevance calculation (text matching, metadata, multipliers, and date/rating bonuses).
- **Backend / Serverless API**: Vercel Serverless Functions in `api/`.

---

## Licensing

By contributing to FindThaGame, you agree that your contributions will be licensed under the [GNU General Public License v3.0 (GPL-3.0)](./LICENSE).
