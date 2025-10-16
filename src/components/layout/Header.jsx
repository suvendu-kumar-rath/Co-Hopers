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
  ListItemText,
  Typography,
  Divider,
  Avatar
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../../assets/images/Logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants/navigation';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [activeLink, setActiveLink] = useState('SERVICES');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, logout } = useAuth();

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

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileClose();
    navigate(ROUTES.SERVICES);
  };

  const mobileMenu = (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      PaperProps={{
        sx: {
          width: '280px',
          background: 'linear-gradient(to bottom, #2d2d2d, #5d5d5d)',
          color: 'white'
        }
      }}
    >
      <List sx={{ pt: 2 }}>
        {/* User Profile Section in Mobile */}
        {isAuthenticated && (
          <>
            <ListItem sx={{ pb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Avatar sx={{ bgcolor: '#2196f3', width: 40, height: 40 }}>
                  {user?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                    {user?.username || 'User'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#00e5ff' }}>
                    {user?.email || 'No email'}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }} />
          </>
        )}

        {/* Navigation Items */}
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

        {/* Logout for Mobile */}
        {isAuthenticated && (
          <>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mt: 2, mb: 1 }} />
            <ListItem 
              onClick={() => {
                handleLogout();
                handleMobileMenuToggle();
              }}
              sx={{
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(255, 59, 59, 0.2)' },
                color: '#ff5252'
              }}
            >
              <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
              <ListItemText 
                primary="Logout" 
                sx={{ color: '#ff5252' }}
              />
            </ListItem>
          </>
        )}
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
          {/* Profile Button - Only show if authenticated */}
          {isAuthenticated && (
            <IconButton 
              color="inherit"
              onClick={handleProfileClick}
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                marginLeft: 2
              }}
            >
              <AccountCircle sx={{ fontSize: { xs: 28, sm: 35 } }} />
            </IconButton>
          )}

          {/* Profile Menu */}
          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 280,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.1)'
              }
            }}
          >
            {/* User Info Section */}
            <Box sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#2196f3', width: 40, height: 40 }}>
                  {user?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                    {user?.username || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || 'No email'}
                  </Typography>
                  {user?.mobile && (
                    <Typography variant="body2" color="text.secondary">
                      {user.mobile}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
            
            <Divider />
            
            {/* Profile Option */}
            <MenuItem 
              onClick={handleProfileClose}
              sx={{ 
                py: 1.5, 
                px: 2,
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <PersonIcon sx={{ mr: 2, color: '#666' }} />
              <Typography>View Profile</Typography>
            </MenuItem>
            
            {/* Logout Option */}
            <MenuItem 
              onClick={handleLogout}
              sx={{ 
                py: 1.5, 
                px: 2,
                '&:hover': { bgcolor: '#ffebee' },
                color: '#d32f2f'
              }}
            >
              <LogoutIcon sx={{ mr: 2 }} />
              <Typography>Logout</Typography>
            </MenuItem>
          </Menu>
          
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