# Tech Stack

## Build System & Framework
- **Vite** - Build tool and dev server
- **React 19** - UI framework with React Router DOM for routing
- **ES Modules** - Modern JavaScript module system

## UI & Styling
- **Bootstrap 5.3** - Primary CSS framework
- **Bootstrap Icons** - Icon library
- **React Icons** - Additional icon components
- **SweetAlert2** - Modal dialogs and alerts

## Data & API
- **Axios** - HTTP client with interceptors for auth tokens
- **Chart.js** + **react-chartjs-2** - Data visualization
- **Recharts** - Alternative charting library

## Utilities
- **jsPDF** - PDF generation
- **html2canvas** - Screenshot/canvas rendering
- **file-saver** - File download utilities
- **xlsx** - Excel file handling

## Development Tools
- **ESLint** - Code linting with React-specific rules
- **@vitejs/plugin-react** - Vite plugin for React Fast Refresh

## Environment Variables
Configuration via `.env` file using Vite's `import.meta.env`:
- `VITE_BASE_URL_API` - Backend API base URL
- `VITE_API_TIMEOUT` - API request timeout

## Common Commands

```bash
# Development server with HMR
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Browser Requirements
Modern browsers with ES6+ support required.
