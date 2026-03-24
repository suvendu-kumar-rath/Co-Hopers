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
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../../assets/images/Logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants/navigation';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import UserProfileModal from '../modals/UserProfileModal';
import UserHistoryModal from '../modals/UserHistoryModal';
import userService from '../../services/userService';

const Header = () => {
  const [activeLink, setActiveLink] = useState('SERVICES');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const showHeaderActions =
    location.pathname === ROUTES.SERVICES || location.pathname === ROUTES.MEETING_ROOM;

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

  // Fetch user profile when authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await userService.getUserProfile();
          if (response.success && response.data) {
            const profile = response.data;
            // Update user context with fresh profile data
            const updatedUser = {
              ...user,
              ...profile,
              ...(profile.memberType ? { memberType: profile.memberType } : { memberType: user.memberType }),
              ...(profile.kycRequired !== null && profile.kycRequired !== undefined
                ? { kycRequired: profile.kycRequired }
                : { kycRequired: user.kycRequired }),
              username: profile.username || profile.companyOrFreelancerName || profile.name || user.username,
              name: profile.name || profile.companyOrFreelancerName || user.name,
              companyOrFreelancerName:
                profile.companyOrFreelancerName || profile.name || user.companyOrFreelancerName,
              mobile: profile.mobile || profile.phone || user.mobile,
              phone: profile.phone || profile.mobile || user.phone,
            };
            updateUser(updatedUser);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated]); // Only run when authentication status changes

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

  const handleViewProfile = () => {
    setProfileModalOpen(true);
    handleProfileClose();
  };

  const handleLogout = () => {
    logout();
    handleProfileClose();
    navigate(ROUTES.SERVICES);
  };

  const handleViewHistory = () => {
    setHistoryModalOpen(true);
    handleProfileClose();
  };

  const handleSignUp = () => {
    setMobileMenuOpen(false);
    if (location.pathname === ROUTES.MEETING_ROOM) {
      navigate(ROUTES.MEETING_ROOM, {
        state: {
          openMeetingRoomAuth: true
        }
      });
      return;
    }

    navigate(ROUTES.SERVICES, {
      state: {
        openBookNowAuth: true
      }
    });
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
            <ListItem 
              onClick={() => {
                setHistoryModalOpen(true);
                handleMobileMenuToggle();
              }}
              sx={{
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                color: '#00e5ff'
              }}
            >
              <HistoryIcon sx={{ mr: 2, fontSize: 20 }} />
              <ListItemText primary="History" />
            </ListItem>
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

        {showHeaderActions && (
          <ListItem
            onClick={handleSignUp}
            sx={{
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <ListItemText
              primary="Sign Up/Sign In"
              sx={{ color: 'white', fontWeight: 'bold' }}
            />
          </ListItem>
        )}

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
      position="fixed"
      sx={{
        backgroundColor: '#000000',
        top: 0,
        left: 0,
        right: 0,
        boxShadow: 'none'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 1.5, sm: 2.5, md: 4 },
          py: 0.4,
          backgroundColor: '#2a2a2a',
          color: '#ffffff',
          fontSize: { xs: '0.7rem', sm: '0.8rem' },
          letterSpacing: '0.02em'
        }}
      >
        <Typography sx={{ fontSize: 'inherit' }}>info@cohopers.in</Typography>
        <Typography sx={{ fontSize: 'inherit' }}>(+91) 83288 30398</Typography>
      </Box>

      <Toolbar sx={{
        justifyContent: 'space-between',
        padding: { xs: '0.5rem 1rem', sm: '0.6rem 2rem', md: '0.75rem 3rem' },
        minHeight: { xs: 64, md: 72 }
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
              height: isMobile ? '38px' : '48px'
            }} 
          />
        </Box>

        {/* Desktop Navigation Links */}
        {!isMobile && (
          <Box sx={{
            display: 'flex',
            gap: { sm: 2.5, md: 4.5 },
            justifyContent: 'center',
            flexGrow: 1
          }}>
            {NAV_ITEMS.map((item) => (
              <Button 
                key={item.label}
                color="inherit" 
                onClick={() => handleNavigation(item)}
                sx={{
                  transition: 'all 0.2s ease-in-out',
                  fontSize: { sm: '0.78rem', md: '0.9rem' },
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  color: '#ffffff',
                  fontWeight: activeLink === item.label ? 700 : 500
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Right side icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {!isMobile && showHeaderActions && (
            <Button
              color="inherit"
              variant="outlined"
              onClick={handleSignUp}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.7)',
                color: '#ffffff',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                px: 2,
                py: 0.6,
                '&:hover': {
                  borderColor: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              Sign Up/Sign In
            </Button>
          )}

          {!isMobile && showHeaderActions && isAuthenticated && (
            <IconButton
              color="inherit"
              onClick={handleProfileClick}
            >
              <AccountCircle sx={{ fontSize: 28 }} />
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
              onClick={handleViewProfile}
              sx={{ 
                py: 1.5, 
                px: 2,
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <PersonIcon sx={{ mr: 2, color: '#666' }} />
              <Typography>View Profile</Typography>
            </MenuItem>

            <MenuItem 
              onClick={handleViewHistory}
              sx={{ 
                py: 1.5, 
                px: 2,
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <HistoryIcon sx={{ mr: 2, color: '#666' }} />
              <Typography>History</Typography>
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
      
      {/* User Profile Modal */}
      <UserProfileModal 
        open={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
      />
      <UserHistoryModal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
      />
    </AppBar>
  );
};

export default Header; 