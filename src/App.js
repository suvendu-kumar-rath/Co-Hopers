import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Services from './components/Services';
import BookMeetingRoom from './components/BookMeetingRoom';
import Form from './components/Form';
import SuccessPage from './components/SuccessPage';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#2d2d2d',
    },
    secondary: {
      main: '#00e5ff',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <div className="App">
            <Header />
            <main style={{ minHeight: 'calc(100vh - 160px)' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/services" replace />} />
                <Route path="/services" element={<Services />} />
                <Route path="/meeting-room" element={<BookMeetingRoom />} />
                <Route path="/form" element={<Form />} />
                <Route path="/pending-review" element={<SuccessPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
