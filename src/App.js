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
import KycRedirectRoute from './components/routes/KycRedirectRoute';
import VisitorKYCAutoRedirect from './components/routes/VisitorKYCAutoRedirect';

// Theme is now imported from separate file

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Router>
            <VisitorKYCAutoRedirect>
              <div className="App">
                <Header />
                <main className="App-main" style={{ marginTop: '150px' }}>
                  <Routes>
                    <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.SERVICES} replace />} />
                    <Route path={ROUTES.SERVICES} element={<Services />} />
                    {/* Direct meeting room booking without KYC check (for registered services users) */}
                    <Route path={ROUTES.MEETING_ROOM} element={<BookMeetingRoom />} />
                    {/* KYC-protected booking route (for visitors from cafeteria/utilities) */}
                    <Route 
                      path={ROUTES.BOOK_MEETING} 
                      element={
                        <KycRedirectRoute>
                          <BookMeetingRoom />
                        </KycRedirectRoute>
                      } 
                    />
                    <Route path={ROUTES.FORM} element={<KYCForm />} />
                    <Route path={ROUTES.PENDING_REVIEW} element={<SuccessPage />} />
                    <Route path={ROUTES.PAYMENT_UPLOAD} element={<PaymentUpload />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </VisitorKYCAutoRedirect>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
