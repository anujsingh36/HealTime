import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import DoctorSearch from './pages/DoctorSearch';
import DoctorDetails from './pages/DoctorDetails';

import PatientDashboard from './pages/patient/Dashboard';
import PatientAppointments from './pages/patient/Appointments';
import PatientRecords from './pages/patient/Records';
import PatientProfile from './pages/patient/Profile';
import BookAppointment from './pages/patient/Book';
import QueueView from './pages/patient/Queue';

import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorQueue from './pages/doctor/Queue';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorAvailability from './pages/doctor/Availability';
import DoctorProfile from './pages/doctor/Profile';

import AdminDashboard from './pages/admin/Dashboard';
import AdminDoctors from './pages/admin/Doctors';
import AdminPatients from './pages/admin/Patients';
import AdminVerify from './pages/admin/Verify';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Landing />} />
        <Route path="auth" element={<Auth />} />
        <Route path="doctors" element={<DoctorSearch />} />
        <Route path="doctors/:id" element={<DoctorDetails />} />
      </Route>

      <Route element={<ProtectedRoute roles={['PATIENT']}><AppLayout /></ProtectedRoute>}>
        <Route path="patient/dashboard" element={<PatientDashboard />} />
        <Route path="patient/appointments" element={<PatientAppointments />} />
        <Route path="patient/records" element={<PatientRecords />} />
        <Route path="patient/profile" element={<PatientProfile />} />
        <Route path="patient/book/:doctorId" element={<BookAppointment />} />
        <Route path="patient/queue/:id" element={<QueueView />} />
      </Route>

      <Route element={<ProtectedRoute roles={['DOCTOR']}><AppLayout /></ProtectedRoute>}>
        <Route path="doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="doctor/queue" element={<DoctorQueue />} />
        <Route path="doctor/appointments" element={<DoctorAppointments />} />
        <Route path="doctor/availability" element={<DoctorAvailability />} />
        <Route path="doctor/profile" element={<DoctorProfile />} />
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN']}><AppLayout /></ProtectedRoute>}>
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/doctors" element={<AdminDoctors />} />
        <Route path="admin/patients" element={<AdminPatients />} />
        <Route path="admin/verify" element={<AdminVerify />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
