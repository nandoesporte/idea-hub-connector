
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import QueryProvider from './providers/QueryProvider.tsx';
import { UserProvider } from './contexts/UserContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <QueryProvider>
          <App />
        </QueryProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
