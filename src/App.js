import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import './App.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Services from './pages/Services';
import BookMeetingRoom from './pages/BookMeetingRoom';
import KYCForm from './components/forms/KYCForm';
import SuccessPage from './pages/SuccessPage';
import PaymentUpload from './pages/PaymentUpload';
import theme from './styles/themes/theme';
import { ROUTES } from './constants/routes';
import { AuthProvider } from './context/AuthContext';

// Theme is now imported from separate file

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Router>
            <div className="App">
              <Header />
              <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                <Routes>
                  <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.SERVICES} replace />} />
                  <Route path={ROUTES.SERVICES} element={<Services />} />
                  <Route path={ROUTES.MEETING_ROOM} element={<BookMeetingRoom />} />
                  <Route path={ROUTES.FORM} element={<KYCForm />} />
                  <Route path={ROUTES.PENDING_REVIEW} element={<SuccessPage />} />
                  <Route path={ROUTES.PAYMENT_UPLOAD} element={<PaymentUpload />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
