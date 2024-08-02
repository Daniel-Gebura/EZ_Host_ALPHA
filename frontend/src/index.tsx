import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './components/pages/HomePage';
import { ServerControlPage } from './components/pages/server_control/ServerControlPage';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} /> {/* This defines the home page */}
          <Route path="/server/:id" element={<ServerControlPage />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);

reportWebVitals();
