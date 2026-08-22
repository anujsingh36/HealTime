import { api } from './client';

export const Auth = {
  login: (data) => api.post('/api/auth/login', data).then(r => r.data),
  register: (data) => api.post('/api/auth/register', data).then(r => r.data),
  me: () => api.get('/api/me').then(r => r.data)
};

export const Doctors = {
  search: (params) => api.get('/api/doctors/search', { params }).then(r => r.data),
  get: (id) => api.get(`/api/doctors/${id}`).then(r => r.data),
  availability: (id) => api.get(`/api/doctors/${id}/availability`).then(r => r.data),
  updateMe: (data) => api.put('/api/doctors/me', data).then(r => r.data),
  setAvailability: (data) => api.put('/api/doctors/me/availability', data).then(r => r.data)
};

export const Specs = {
  list: () => api.get('/api/specializations').then(r => r.data)
};

export const Appointments = {
  book: (data) => api.post('/api/patient/appointments', data).then(r => r.data),
  mine: () => api.get('/api/patient/appointments').then(r => r.data),
  cancel: (id) => api.delete(`/api/patient/appointments/${id}`),
  queue: (id) => api.get(`/api/patient/appointments/${id}/queue`).then(r => r.data),
  updateLocation: (id, lat, lng) => api.patch(`/api/patient/appointments/${id}/location`, { lat, lng }),
  doctorList: () => api.get('/api/doctor/appointments').then(r => r.data),
  doctorQueue: () => api.get('/api/doctor/queue').then(r => r.data),
  setStatus: (id, body) => api.patch(`/api/doctor/appointments/${id}/status`, body).then(r => r.data)
};

export const Records = {
  mine: () => api.get('/api/patient/records').then(r => r.data),
  upload: (form) => api.post('/api/patient/records', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  forPatient: (patientId) => api.get(`/api/doctor/patients/${patientId}/records`).then(r => r.data),
  // Records may contain sensitive health data, so files are served through an authenticated
  // endpoint rather than a public static path — fetch as a blob and open that instead of
  // linking directly to the URL (a plain <a href> wouldn't carry the auth token).
  openFile: async (recordId) => {
    const res = await api.get(`/api/records/${recordId}/file`, { responseType: 'blob' });
    const blobUrl = URL.createObjectURL(res.data);
    window.open(blobUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  }
};

export const Prescriptions = {
  create: (data) => api.post('/api/doctor/prescriptions', data).then(r => r.data),
  mine: () => api.get('/api/patient/prescriptions').then(r => r.data),
  forAppointment: (id) => api.get(`/api/appointments/${id}/prescriptions`).then(r => r.data)
};

export const Notifications = {
  list: () => api.get('/api/notifications').then(r => r.data),
  unread: () => api.get('/api/notifications/unread-count').then(r => r.data),
  markRead: (id) => api.post(`/api/notifications/${id}/read`)
};

export const Admin = {
  stats: () => api.get('/api/admin/stats').then(r => r.data),
  patients: () => api.get('/api/admin/patients').then(r => r.data),
  doctors: () => api.get('/api/admin/doctors').then(r => r.data),
  verify: (id) => api.post(`/api/admin/doctors/${id}/verify`),
  disable: (id) => api.post(`/api/admin/users/${id}/disable`)
};