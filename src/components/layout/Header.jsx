import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import Logo from '../../assets/images/Logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants/navigation';
import { ROUTES } from '../../constants/routes';

const Header = () => {
  const [activeLink, setActiveLink] = useState('SERVICES');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Set active link based on current route
  useEffect(() => {
    if (location.pathname === ROUTES.SERVICES || location.pathname === ROUTES.HOME) {
      setActiveLink('SERVICES');
    } else if (location.pathname === ROUTES.MEETING_ROOM) {
      setActiveLink('MEETING ROOM');
    }
  }, [location.pathname]);

  // Navigate to services page by default when component mounts
  useEffect(() => {
    if (location.pathname === ROUTES.HOME) {
      navigate(ROUTES.SERVICES);
    }
  }, [navigate, location.pathname]);

  const handleNavigation = (item) => {
    setActiveLink(item.label);
    setMobileMenuOpen(false);
    
    if (item.external) {
      window.location.href = item.path;
    } else {
      navigate(item.path);
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const mobileMenu = (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      PaperProps={{
        sx: {
          width: '250px',
          background: 'linear-gradient(to bottom, #2d2d2d, #5d5d5d)',
          color: 'white'
        }
      }}
    >
      <List sx={{ pt: 2 }}>
        {NAV_ITEMS.map((item) => (
          <ListItem 
            key={item.label} 
            onClick={() => handleNavigation(item)}
            sx={{
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              ...(activeLink === item.label && { backgroundColor: 'rgba(255, 255, 255, 0.1)' })
            }}
          >
            <ListItemText 
              primary={item.label} 
              sx={{
                color: activeLink === item.label ? 'white' : '#00e5ff',
                fontWeight: activeLink === item.label ? 'bold' : 'normal'
              }}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(to bottom, #2d2d2d, #5d5d5d)',
      }}
    >
      <Toolbar sx={{ 
        justifyContent: 'space-between',
        padding: { xs: '0.5rem', sm: '0.5rem 1rem', md: '0.5rem 2rem' }
      }}>
        {/* Logo */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            flexGrow: { xs: 1, md: 0 }
          }} 
          onClick={() => handleNavigation('SERVICES')}
        >
          <img 
            src={Logo} 
            alt="CoHoppers Logo" 
            style={{ 
              height: isMobile ? '50px' : '70px',
              marginRight: '10px'
            }} 
          />
        </Box>

        {/* Desktop Navigation Links */}
        {!isMobile && (
          <Box sx={{ 
            display: 'flex', 
            gap: { sm: 2, md: 4 },
            justifyContent: 'center',
            flexGrow: 1
          }}>
            {NAV_ITEMS.map((item) => (
              <Button 
                key={item.label}
                color="inherit" 
                onClick={() => handleNavigation(item)}
                sx={{
                  transition: 'all 0.3s ease-in-out',
                  fontSize: { sm: '0.9rem', md: '1.1rem' },
                  whiteSpace: 'nowrap',
                  ...(activeLink === item.label 
                    ? { color: 'white', fontWeight: 'bold' } 
                    : { color: '#00e5ff' })
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Right side icons */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="inherit"
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
              marginLeft: 2
            }}
          >
            <AccountCircle sx={{ fontSize: { xs: 28, sm: 35 } }} />
          </IconButton>
          
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={handleMobileMenuToggle}
              sx={{ marginLeft: 1 }}
            >
              <MenuIcon sx={{ fontSize: 28 }} />
            </IconButton>
          )}
        </Box>
      </Toolbar>
      {mobileMenu}
    </AppBar>
  );
};

export default Header; 