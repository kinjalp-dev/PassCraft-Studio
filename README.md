# Template Pass Admin Dashboard

A React + TypeScript admin dashboard for managing image templates and user downloads.

## Features

- **Dashboard**: KPI cards with sparklines and stats.
- **Template Management**: 
  - List view with sorting and actions.
  - **Interactive Editor**: Drag-and-drop placeholder positioning on uploaded images.
  - Preview mode for simulating user results.
- **User Tracking**: Download history table with CSV export.
- **Mock API**: Fully functional client-side simulation of a backend.

## Tech Stack

- **React 18**
- **TypeScript**
- **Tailwind CSS** (via CDN for simplicity in this scaffold, can be local)
- **React Query** (Data Fetching)
- **Zustand** (State Management)
- **Lucide React** (Icons)
- **Recharts** (Sparklines)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

- `src/api`: Mock data and client logic.
- `src/components/ui`: Reusable UI components (Modal, Table, KPICard).
- `src/components/editor`: The logic for the template canvas editor.
- `src/pages`: Main route views.
- `src/store.ts`: Global state (Auth, Toasts).

## Note on API

Currently, `api/client.ts` uses `mockData.ts` and in-memory storage. To connect to a real backend, replace the functions in `client.ts` with real `fetch` or `axios` calls.
