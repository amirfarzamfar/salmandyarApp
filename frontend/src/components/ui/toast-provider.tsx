"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        style: {
          background: '#fff',
          color: '#333',
          fontFamily: 'var(--font-vazirmatn)',
          borderRadius: '1rem',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
          border: '1px solid #f3f4f6',
          padding: '12px 16px',
          fontSize: '0.875rem',
          fontWeight: 600,
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
