import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.warn('🚨 Unhandled promise rejection:', event.reason);
  
  // Check if it's the specific Object.keys error we're seeing
  if (event.reason && event.reason.message && 
      event.reason.message.includes('Cannot convert undefined or null to object') &&
      event.reason.message.includes('Object.keys')) {
    console.warn('🔧 Suppressing Object.keys error from external script');
    event.preventDefault(); // Prevent the error from showing in console
  }
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.warn('🚨 Uncaught error:', event.error);
  
  // Check if it's the specific Object.keys error we're seeing
  if (event.error && event.error.message && 
      event.error.message.includes('Cannot convert undefined or null to object') &&
      event.error.message.includes('Object.keys')) {
    console.warn('🔧 Suppressing Object.keys error from external script');
    event.preventDefault(); // Prevent the error from showing in console
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
