import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Auth Components
import { AuthProvider } from './auth/AuthContext';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ProtectedRoute from './auth/ProtectedRoute';

// App Components
import NavMenu from './shared/NavMenu';
import HomePage from './home/HomePage';
import QuizEditorPage from './items/QuizEditorPage';
import QuizTakerPage from './items/QuizTakerPage'; // <--- New Import

// Styles
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <NavMenu />
        <Container className="mt-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes (Only for logged in users) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              
              {/* Quiz Creator/Editor Routes */}
              <Route path="/create-quiz" element={<QuizEditorPage />} />
              <Route path="/edit-quiz/:id" element={<QuizEditorPage />} />
              
              {/* Quiz Taker Route (Updated) */}
              <Route path="/take-quiz/:id" element={<QuizTakerPage />} />
            </Route>

            {/* Catch-all: Redirect unknown paths to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
};

export default App;