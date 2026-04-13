import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
// StrictMode intentionally disabled: it double-mounts components in dev which
// terminates the LiveKit WebSocket mid-ICE-handshake, causing SIGNAL_SOURCE_CLOSE
// and a broken classroom connection. Re-enable only after migrating to a
// connection library that tolerates mount/unmount cycles (e.g. persistent Room ref).
root.render(<App />);
