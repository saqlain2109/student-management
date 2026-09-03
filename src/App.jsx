import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import StudentsList from './pages/students/StudentsList';
import StudentForm from './pages/students/StudentForm';
import StudentProfile from './pages/students/StudentProfile';
import FeesDashboard from './pages/fees/FeesDashboard';
import RecordPayment from './pages/fees/RecordPayment';
import CoursesList from './pages/courses/CoursesList';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Students Module */}
            <Route path="students" element={<StudentsList />} />
            <Route path="students/new" element={<StudentForm />} />
            <Route path="students/:id" element={<StudentProfile />} />
            <Route path="students/:id/edit" element={<StudentForm />} />
            
            {/* Courses Module */}
            <Route path="courses" element={<CoursesList />} />
            
            {/* Fees Module */}
            <Route path="fees" element={<FeesDashboard />} />
            <Route path="fees/record/:studentId?" element={<RecordPayment />} />
          </Route>

          {/* Catch all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
