import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import LoginPage from './components/auth/LoginPage';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import FamilyMembersPage from './components/family/FamilyMembersPage';
import MedicalRecordsPage from './components/records/MedicalRecordsPage';
import InsurancePoliciesPage from './components/policies/InsurancePoliciesPage';
import ClaimsPage from './components/claims/ClaimsPage';
import RemindersPage from './components/reminders/RemindersPage';
import EmergencySummaryPage from './components/emergency/EmergencySummaryPage';
import './index.css';

function PrivateRoute({ children }) {
  return authService.isAuthenticated() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="family" element={<FamilyMembersPage />} />
          <Route path="records" element={<MedicalRecordsPage />} />
          <Route path="policies" element={<InsurancePoliciesPage />} />
          <Route path="claims" element={<ClaimsPage />} />
          <Route path="reminders" element={<RemindersPage />} />
          <Route path="emergency" element={<EmergencySummaryPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
