import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/authProvider.jsx';
import { CartProvider } from './context/cartProvider.jsx';
import { BatchDetailProvider } from './context/batchDetailProvider.jsx';
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <CartProvider>
                <BatchDetailProvider>
                    <App />
                </BatchDetailProvider>
            </CartProvider>
        </AuthProvider>
    </React.StrictMode>,
);
