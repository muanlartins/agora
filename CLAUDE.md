# Agora - Debate Club Management Platform

> **Important**: This file should be kept up-to-date with any changes to the repository's standards, patterns, and features. When making significant changes, update the relevant sections of this document.

## Overview

Agora is a web application for managing a debate club/society. It handles member management, debate tracking, tournament participation, articles, goals, and generates rankings and visualizations based on debate performance data.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│    DynamoDB     │
│   Angular 16    │     │   .NET 8 Lambda │     │   (sa-east-1)   │
│   (S3 bucket)   │     │  (Function URL) │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

- **Frontend**: Angular 16 with Angular Material, deployed as static files to S3
- **Backend**: .NET 8.0 API running as AWS Lambda with function URLs (repo: `agora-api`)
- **Database**: DynamoDB (non-relational) - tables for users, members, debates, participants, articles, goals

## UI/UX Design System

### Design Philosophy

**Aesthetic**: Private Club Elegance - Professional & Corporate meets Clean & Minimal

The UI is designed for non-technical users (primarily lawyers). Every element must have a clear purpose. We prioritize:

1. **Simplicity first** - Every element must have a clear purpose
2. **Professional elegance** - Subtle refinement over flashy effects
3. **Accessibility** - High contrast, readable typography, keyboard navigation
4. **Consistency** - Use design tokens (colors, spacing, typography) consistently
5. **Dark mode default** - Optimized for dark theme, light theme available

### Color Palette

```scss
// Primary - Sophisticated Gold
$primary: #D4A537;
$primary-light: #E8C56A;
$primary-dark: #B8922F;

// Dark Theme (Default)
$background-dark: #0A0A0A;
$surface-dark: #141414;
$surface-elevated-dark: #1E1E1E;
$border-dark: #2A2A2A;

// Light Theme
$background-light: #FAFAF8;
$surface-light: #FFFFFF;
$border-light: #E5E5E3;
```

### Typography

- **Display Font**: Playfair Display (serif) - for headings and titles
- **Body Font**: DM Sans (sans-serif) - for body text and UI elements

### Theme Support

The application supports dark and light themes via `ThemeService`:
- Default: Dark mode
- Theme preference stored in localStorage
- Toggle available (can be added to UI components)

### Key Design Files

- `src/variables.scss` - All design tokens (colors, typography, spacing, etc.)
- `src/styles.scss` - Global styles and theme configuration
- `src/app/services/theme.service.ts` - Theme switching logic

## Local Development

### Prerequisites
- Node.js (for Angular)
- .NET 8 SDK
- AWS credentials (for DynamoDB access)

### Backend Setup (agora-api)
1. Create a `.env` file in `agora-api/` with:
   ```
   ACCESS_KEY=<aws-access-key>
   SECRET_KEY=<aws-secret-key>
   JWT_KEY=<jwt-signing-key>
   PASSWORD_SALT=<password-hash-salt>
   ```
2. Run: `dotnet run`
3. Backend runs at `http://localhost:5191`

### Frontend Setup (agora)
1. Install dependencies: `npm install`
2. **Important**: Toggle API URL in `src/app/utils/constants.ts`:
   - Comment out the production Lambda URL
   - Uncomment the localhost URL (`http://localhost:5191`)
3. Run: `npm start`
4. Frontend runs at `http://localhost:4200`

### Quick Start
Use the provided script to start both services:
```bash
./start-dev.sh
```

## Project Structure

```
agora/
├── src/
│   ├── variables.scss        # Design tokens
│   ├── styles.scss           # Global styles
│   ├── app/
│   │   ├── components/       # Feature components (debates, members, articles, etc.)
│   │   ├── services/         # API communication + ThemeService
│   │   ├── guards/           # Route guards (login, admin)
│   │   ├── interceptors/     # HTTP interceptors (auth, loading)
│   │   ├── models/
│   │   │   ├── types/        # TypeScript interfaces
│   │   │   ├── enums/        # Enumerations
│   │   │   └── converters/   # Data conversion utilities
│   │   └── utils/
│   │       ├── components/   # Reusable UI components (navbar, spinner, etc.)
│   │       ├── constants.ts  # API URL and configuration
│   │       ├── token.ts      # JWT token management
│   │       └── auth.ts       # Auth utilities
│   ├── environments/         # Environment configuration
│   └── assets/               # Images and static files
└── cypress/                  # E2E tests
```

### Key Components
- **LandingPageComponent**: Public landing page for outsiders
- **DebatesComponent**: Manage and track debates
- **MembersComponent**: Member management
- **TournamentComponent**: Tournament tracking
- **ArticlesComponent**: Article publishing
- **GoalsComponent**: Goal tracking
- **ReportComponent**: Member performance reports with rankings
- **NavbarComponent**: Navigation for authenticated pages
- **TabbyArchiveComponent**: Public tournament archive viewer (see Tabby Archive section below)

### Services
Each service handles CRUD operations for its domain:
- `DebateService`, `MemberService`, `ArticleService`, `GoalService`
- `TournamentService`, `ParticipantService`, `UserService`, `RankService`
- `ThemeService` - Dark/light theme management

## Deployment

### Frontend
1. Build: `npm run build`
2. Upload `dist/agora/` contents to S3 bucket

### Backend
1. Publish:
   ```bash
   dotnet publish --configuration Release --framework net8.0 --runtime linux-x64 --self-contained false
   ```
2. Zip the `bin/Release/net8.0/publish/` directory
3. Update Lambda function with the zip file

## Authentication

- JWT-based authentication with Bearer tokens
- Token stored in localStorage
- Auth interceptor attaches token to all requests
- Routes prefixed with `/public/` are accessible without authentication

## Tech Stack

**Frontend:**
- Angular 16, TypeScript, RxJS
- Angular Material (primary UI library)
- ng-zorro-antd (legacy, being phased out)
- chart.js (visualizations)
- ngx-markdown

**Backend:**
- .NET 8.0, C#
- AWS Lambda, DynamoDB, S3
- JWT authentication

## Tabby Archive (Tournament Results Viewer)

The Tabby Archive is a public page (`/tabby-archive`) that displays historical tournament results. It fetches tournament data from XML files stored in S3.

### Data Source

Tournament XML files are stored in S3 at:
```
https://tabbyarchive.s3.sa-east-1.amazonaws.com/{tournament-id}.xml
```

Example: `https://tabbyarchive.s3.sa-east-1.amazonaws.com/condeb-2024.xml`

### XML Data Structure (BP Debate Format)

The XML contains the following key elements:

#### Speaker Categories (`speakerCategories`)
- Defines categories like "Open", "Novice", "EFL", etc.
- Example: `SC1=Open`, `SC2=Novice`
- Speakers are tagged with one or more category IDs
- A speaker with category "Novice" typically also has "Open" (novice speakers can compete in open brackets)

#### Break Categories (`breakCategories`)
- For team eligibility in elimination rounds
- Example: `BC1=Aberto` (Open), `BC2=Iniciados` (Novice)
- Linked to elimination rounds via the `break-category` attribute

#### Rounds
- **Preliminary rounds**: All teams compete against each other (~5 rounds)
- **Elimination rounds**: Teams split by break category (Open finals, Novice finals, etc.)
- Each round has: `roundName`, `roundAbbreviation`, `isEliminationRound`

### Display Logic

The UI shows **N+1 views** for statistics and results:
1. **"Todos"** - All speakers/teams regardless of category
2. **One tab per speaker category** (Open, Novice, etc.)

#### Category Filtering Rules
- A **speaker** belongs to a category if their `speakerCategories` array contains that category
- A **team** belongs to a category if **at least one** of its speakers has that category
- Novice speakers are typically also tagged as Open, so they appear in both rankings

### Component Architecture

**File**: `src/app/components/tabby-archive/tabby-archive.component.ts`

Key patterns used to avoid performance issues:

1. **Cached Computed Values**: All expensive computations are cached in component properties and updated only when tournament data changes (via `updateCachedValues()`). This prevents infinite change detection loops.

2. **Sanitized HTML for Motions**: Motions may contain HTML tags. Uses `DomSanitizer` with a cache (`sanitizedMotions` Map) to safely render HTML without re-sanitizing on each change detection cycle.

3. **Category-Based Caching**: Maps like `speakersByCategoryCached` and `teamsByCategoryCached` store filtered data per category.

### UI Structure

```
Tabby Archive Page
├── Header (Tournament name, dates)
├── Main Tabs
│   ├── Estatísticas (Statistics)
│   │   └── Nested Category Tabs (Todos, Open, Novice, ...)
│   │       ├── Winner/Finalists
│   │       ├── Top 3 Teams
│   │       └── Top 3 Speakers
│   ├── Rodadas (Rounds) - Expansion panels per round
│   ├── Participantes (Participants) - Teams, Speakers, Adjudicators, Institutions
│   ├── Moções (Motions) - HTML content per round
│   └── Resultados (Results)
│       └── Nested Category Tabs (Todos, Open, Novice, ...)
│           ├── Full Team Standings table
│           └── Full Speaker Stats table
└── Footer
```
