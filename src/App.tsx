import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { NoteEditor } from './pages/NoteEditor';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/auth" element={<Navigate to="/signin" replace />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notes" element={<Dashboard />} />
            <Route path="/create" element={<NoteEditor />} />
            <Route path="/edit/:id" element={<NoteEditor />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}
