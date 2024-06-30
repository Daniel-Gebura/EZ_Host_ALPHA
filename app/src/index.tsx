import React, { useEffect } from 'react';
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

const App = () => {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');
    ws.onmessage = (event) => {
      if (event.data === 'update') {
        window.location.reload();
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Central />} />
          <Route path="/Dummy" element={<Dummy />} />
          <Route path="/server/:id" element={<ServerControl />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
