# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SAINT Explorer is a React-based security detection rules management interface for the SAINT (Security Architecture, Integration, and Normalization Toolkit) platform. It provides search, analysis, and management capabilities for security detection rules.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (port 5173)
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Tech Stack & Architecture

### Core Technologies
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Libraries**: Material-UI (@mui), Mantine
- **State Management**: Zustand for client state, TanStack Query for server state
- **Authentication**: AWS Cognito via react-oidc-context
- **Routing**: React Router v6
- **API Client**: Axios with Lambda API Gateway integration

### Project Structure

```
src/
├── api/           # API layer with Lambda proxy integration
│   ├── client.ts  # Axios configuration with auth interceptors
│   ├── types.ts   # TypeScript types for API responses
│   └── queries.ts # TanStack Query hooks
├── components/    # Reusable UI components
│   ├── common/    # Generic components (Cards, Badges, etc.)
│   ├── layout/    # App layout components (Header, Sidebar)
│   └── rules/     # Rule-specific components
├── pages/         # Route-level components
├── store/         # Zustand stores for client state
├── hooks/         # Custom React hooks
└── contexts/      # React contexts
```

### Key Implementation Details

#### Authentication Flow
- Uses AWS Cognito for authentication
- Tokens stored in sessionStorage (id_token, access_token)
- Auto-renewal and session monitoring enabled
- Auth interceptor in `src/api/client.ts:23-31` adds Bearer token to requests

#### API Integration
- Lambda API Gateway endpoint configured in environment variables
- Development proxy configured in `vite.config.ts:19-37`
- Response transformation handles Lambda proxy integration format (`src/api/client.ts:120-133`)
- Array parameters converted to comma-separated strings for Lambda compatibility

#### State Management Pattern
- Zustand for UI state (selected rules, filters)
- TanStack Query for server data with 5-minute stale time
- No retry on 4xx errors except 429 (rate limiting)

#### Error Handling
- Global error boundary in `src/main.tsx:46-76`
- API error interceptor handles auth failures with redirect
- Toast notifications via react-hot-toast

## Environment Variables

Required environment variables:
- `VITE_APP_URL` - Application base URL
- `VITE_COGNITO_DOMAIN` - Cognito auth domain
- `VITE_COGNITO_CLIENT_ID` - Cognito client ID
- `VITE_API_GATEWAY_URL` - Production API Gateway URL
- `VITE_API_URL` - Development API URL (optional)

## TypeScript Configuration

- Path alias `@/` maps to `src/` directory
- Strict type checking enabled
- Multiple tsconfig files for different contexts (app, node)