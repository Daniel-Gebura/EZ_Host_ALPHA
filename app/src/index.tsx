import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/navigation/Layout';
import { Central } from './pages/Central';
import { Dummy } from './pages/Dummy';
import { ServerControl } from './pages/ServerControl';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Central />} /> {/* This defines the home page */}
          <Route path="/Dummy" element={<Dummy />} />
          <Route path="/server/:id" element={<ServerControl />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);

reportWebVitals();
