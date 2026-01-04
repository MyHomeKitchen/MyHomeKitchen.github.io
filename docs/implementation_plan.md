# Implementation Plan - MyHomeKitchen

## Goal Description
Create a free, frontend-only web application for managing home and kitchen lists (grocery, appliances, etc.). The app will be hosted on GitHub Pages and focus on mobile users, offering offline capabilities via browser storage, dark/light themes, and multi-language support.

## User Review Required
> [!IMPORTANT]
> **Tech Stack Choice**: We need to decide between **Vanilla JS** (simpler, no build step potentially) or **React (via Vite)** (easier state management, component reuse, better ecosystem for i18n).
> **Proposal**: I recommend **React + Vite** for better scalability, especially for handling state (lists), i18n, and themes cleanly.

> [!NOTE]
> **Storage Strategy**: Since there is no backend, all data will be stored in the user's browser (LocalStorage/IndexedDB).
> *Risk*: If the user clears browser data, they lose their lists.
> *Mitigation*: We will implement a "Export/Backup" feature to save a file.

## Proposed Tech Stack
- **Framework**: React (managed via Vite for optimal performance)
- **Language**: JavaScript (ES6+)
- **Styling**: Vanilla CSS (using CSS Variables for Theming)
- **Icons**: Lucide React (clean, lightweight icons)
- **Storage**: `idb` (IndexedDB wrapper) or `localStorage` for data persistence
- **Internationalization**: `react-i18next` for language support
- **Hosting**: GitHub Actions to deploy to GitHub Pages

## Features Breakdown

### 1. Project Setup
- Initialize Vite project.
- Setup simple folder structure: `components`, `hooks`, `locales`, `styles`.

### 2. Design System & Theming
- **Mobile First**: CSS Grid/Flexbox layouts optimized for touch.
- **Theming**:
    - Toggle button (Sun/Moon).
    - `data-theme` attribute on `<html>`.
    - CSS variables for colors (`--bg-primary`, `--text-main`, etc.).

### 3. Internationalization (i18n)
- Support English (default).
- Structure for adding other languages (JSON files).
- Language switcher in settings/header.

### 4. Data Management (The "DB")
- **Schema**:
    - `lists`: Array of list objects `{ id, title, type (grocery, appliance, etc.), items: [], createdAt }`.
    - **Items**: Each item will have `{ id, name, isChecked, icon: "🍌" }`.
    - `settings`: User preferences (theme, language).
- **App State**: React Context or Hooks to manage live data and sync to storage.

### 5. Visuals & Icons
- **Icon Strategy**: Use `lucide-react` (Lightweight SVGs) or `react-icons` (includes FontAwesome).
- **Storage**: Icons are bundled in the app (no external requests).
- **Implementation**:
    - Map categories/keywords to specific icons (e.g., "Bananas" -> Banana Icon).
    - Allow user to pick from a grid of bundled icons.
    - All assets stored in the repo as code/SVGs to keep size low.

### 6. Sharing & Export
- **Print/PDF**: CSS `@media print` styling to create clean, printable lists that can be saved as PDF natively check items off on paper.
- **Clipboard**: "Copy Flow" to put list text into clipboard.
- **Web Share**: Standard share sheet for mobile.

## Verification Plan

### Automated Tests
- Build verification (`npm run build`).
- Lint checks.
- **Docker Test**: Build and run container locally to ensure environment consistency.

### Manual Verification
- **Mobile Responsiveness**: Test on mobile viewports (Chrome DevTools).
- **Theming**: Switch modes and verify color contrast.
- **Persistence**: Refresh page, close/reopen tab, verify data remains.
- **Offline**: Disconnect internet and verify app functionality (basic PWA capabilities).
