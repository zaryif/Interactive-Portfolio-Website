// Entry point for the React application.
// This file handles the initial rendering of the App component into the HTML DOM.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Find the root DOM element where the React app will be mounted.
// This element is defined in `index.html`.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create a React root for the `rootElement`.
// This is the modern way to render React apps (React 18+).
const root = ReactDOM.createRoot(rootElement);

// Render the main App component into the root.
// React.StrictMode is a wrapper that helps identify potential problems in an app.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
