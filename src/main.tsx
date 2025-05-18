import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App'; // Ensure this matches the export in App.tsx
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { AssignmentProvider } from './contexts/AssignmentContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AssignmentProvider>
        <App />
      </AssignmentProvider>
    </ThemeProvider>
  </StrictMode>,
);
