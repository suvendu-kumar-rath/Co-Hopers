import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, IconButton, Box } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logo from '../assets/images/Logo.png';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [activeLink, setActiveLink] = useState('SERVICES');
  const navigate = useNavigate();
  const location = useLocation();

  // Set active link based on current route
  useEffect(() => {
    if (location.pathname === '/services' || location.pathname === '/') {
      setActiveLink('SERVICES');
    } else if (location.pathname === '/meeting-room') {
      setActiveLink('MEETING ROOM');
    }
  }, [location.pathname]);

  // Navigate to services page by default when component mounts
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/services');
    }
  }, [navigate, location.pathname]);

  const navItems = ['HOME', 'ABOUT US', 'SERVICES', 'MEETING ROOM', 'CONTACT US'];

  const handleNavigation = (item) => {
    setActiveLink(item);
    if (item === 'HOME') {
      window.location.href = 'https://co-hopers.vercel.app/index.html';
    } else if (item === 'MEETING ROOM') {
      navigate('/meeting-room');
    } else if (item === 'SERVICES') {
      navigate('/services');
    }
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(to bottom, #2d2d2d, #5d5d5d)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleNavigation('SERVICES')}>
          <img src={Logo} alt="CoHoppers Logo" style={{ height: '70px', marginRight: '10px' }} />
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', gap: 4 }}>
          {navItems.map((item) => (
            <Button 
              key={item}
              color="inherit" 
              onClick={() => handleNavigation(item)}
              sx={{
                transition: 'all 0.3s ease-in-out',
                ...(activeLink === item 
                  ? { color: 'white', fontWeight: 'bold', fontSize: '1.1rem' } 
                  : { color: '#00e5ff', fontSize: '1.1rem' })
              }}
            >
              {item}
            </Button>
          ))}
        </Box>

        {/* Account Icon */}
        <IconButton color="inherit">
          <AccountCircle sx={{ fontSize: 35 }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 