import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { BooksPage } from './pages/BooksPage';
import { IssueBookPage } from './pages/IssueBookPage';
import { MemberHistoryPage } from './pages/MemberHistoryPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/books" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/books" element={<BooksPage />} />
                <Route
                  path="/issue"
                  element={
                    <ProtectedRoute>
                      <IssueBookPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/history" element={<MemberHistoryPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
