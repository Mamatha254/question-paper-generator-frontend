// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import CustomNavbar from './components/CustomNavbar';
import Login from './pages/Login';
import Register from './pages/Register'; // <-- Import Register
import Dashboard from './pages/Dashboard';
import SubjectList from './pages/admin/SubjectList';
import QuestionList from './pages/admin/QuestionList';
import GeneratePaper from './pages/GeneratePaper';
import ProtectedRoute from './helpers/ProtectedRoute';
import AuthService from './services/auth.service';

// Import react-toastify CSS
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const currentUser = AuthService.getCurrentUser();

  return (
    <Router>
      <CustomNavbar />
      <div className="container mt-3">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
          {/* Uncomment or add Register route */}
          <Route path="/register" element={currentUser ? <Navigate to="/" /> : <Register />} />

          {/* Protected Routes (require login) */}
          {/* ... other routes ... */}
           <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_FACULTY']} />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/generate-paper" element={<GeneratePaper />} />
          </Route>

          {/* Admin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route path="/admin/subjects" element={<SubjectList />} />
            <Route path="/admin/questions" element={<QuestionList />} />
            {/* Add other admin routes here */}
          </Route>

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
          {/* Or a dedicated NotFound component: <Route path="*" element={<NotFound />} /> */}

        </Routes>
      </div>
       <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
       />
    </Router>
  );
}

export default App;