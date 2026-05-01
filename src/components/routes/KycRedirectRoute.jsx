import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button, Alert, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import { useAuth } from '../../context/AuthContext';
import { kycService } from '../../services/kycService';
import { ROUTES } from '../../constants/routes';

/**
 * KycRedirectRoute Component
 * Protects the booking page with KYC verification for visitors
 * Workflow:
 * - NOT_SUBMITTED: Redirects to KYC form
 * - PENDING: Shows awaiting approval message
 * - APPROVED/VERIFIED: Allows access to booking
 * - REJECTED: Shows error message
 */
const KycRedirectRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user came from visitor entry points (cafeteria, utilities, etc.)
  const isVisitorFromEligibleEntry = () => {
    // Check 1: User type is explicitly 'visitor' from backend
    if (user?.userType === 'visitor') {
      return true;
    }

    // Check 2: User has a visitor flag
    if (user?.isVisitor === true) {
      return true;
    }

    // Check 3: User has visitor source
    if (user?.source === 'visitor' || user?.source === 'cafeteria' || user?.source === 'utilities') {
      return true;
    }

    // Check 4: Location state indicates visitor
    if (
      location.state?.source === 'cafeteria' || 
      location.state?.source === 'utilities' ||
      location.state?.source === 'visitor'
    ) {
      return true;
    }

    return false;
  };

  // Check KYC status on component mount and when user changes
  useEffect(() => {
    const checkKYCStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        // If user is not authenticated, don't check KYC
        if (!isAuthenticated || !user?.id) {
          setKycStatus(null);
          return;
        }

        // Only check KYC for visitors from eligible entry points
        if (!isVisitorFromEligibleEntry()) {
          setKycStatus('ELIGIBLE_NO_CHECK'); // Allow access without KYC check
          return;
        }

        // Fetch KYC status from API
        const response = await kycService.getKYCStatus(user.id);

        if (response.success) {
          const status = response.data?.status || response.data?.kycStatus || 'NOT_SUBMITTED';
          setKycStatus(status.toUpperCase());
          console.log('[KycRedirectRoute] KYC Status:', status);
        } else {
          // If we can't get KYC status, assume NOT_SUBMITTED for security
          setKycStatus('NOT_SUBMITTED');
          console.log('[KycRedirectRoute] Could not fetch KYC status, defaulting to NOT_SUBMITTED');
        }
      } catch (err) {
        console.error('[KycRedirectRoute] Error checking KYC status:', err);
        // On error, assume NOT_SUBMITTED for security
        setKycStatus('NOT_SUBMITTED');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkKYCStatus();
    }
  }, [isAuthenticated, user?.id, authLoading, location.state?.source]);

  // Loading state
  if (authLoading || loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 160px)',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Verifying KYC status...</Typography>
      </Box>
    );
  }

  // Not authenticated - redirect to services
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.SERVICES} replace />;
  }

  // No KYC check needed - allow access
  if (kycStatus === 'ELIGIBLE_NO_CHECK') {
    return children;
  }

  // KYC Not Submitted - redirect to KYC form
  if (kycStatus === 'NOT_SUBMITTED') {
    return (
      <Navigate
        to={ROUTES.FORM}
        replace
        state={{
          returnPath: ROUTES.MEETING_ROOM,
          source: 'booking_kyc_redirect',
          message: 'Please complete KYC verification to proceed with booking',
        }}
      />
    );
  }

  // KYC Pending Approval - show awaiting message
  if (kycStatus === 'PENDING') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 160px)',
          px: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 500,
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <PendingIcon
              sx={{
                fontSize: 80,
                color: '#FF9800',
              }}
            />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              color: '#2d2d2d',
            }}
          >
            KYC Under Review
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#666',
              mb: 3,
              lineHeight: 1.6,
            }}
          >
            Your KYC verification is awaiting approval. This typically takes 1-2 business days.
            Once approved, you'll be able to book meeting rooms.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#999',
              mb: 3,
              fontStyle: 'italic',
            }}
          >
            We'll notify you as soon as your KYC is approved.
          </Typography>

          <Button
            variant="contained"
            sx={{
              bgcolor: '#8BC34A',
              color: 'white',
              '&:hover': {
                bgcolor: '#7CB342',
              },
            }}
            href={ROUTES.SERVICES}
          >
            Go to Services
          </Button>
        </Paper>
      </Box>
    );
  }

  // KYC Approved or Verified - allow access
  if (kycStatus === 'APPROVED' || kycStatus === 'VERIFIED') {
    return children;
  }

  // KYC Rejected - show error message
  if (kycStatus === 'REJECTED') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 160px)',
          px: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 500,
            textAlign: 'center',
            borderRadius: 2,
            borderLeft: '5px solid #f44336',
          }}
        >
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 80,
                color: '#f44336',
              }}
            />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              color: '#f44336',
            }}
          >
            KYC Verification Rejected
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#666',
              mb: 3,
              lineHeight: 1.6,
            }}
          >
            Your KYC verification has been rejected. Unfortunately, you cannot proceed with booking at this time.
          </Typography>

          <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
            Please contact our support team for more information about the rejection and to resubmit your KYC.
          </Alert>

          <Button
            variant="contained"
            sx={{
              bgcolor: '#f44336',
              color: 'white',
              '&:hover': {
                bgcolor: '#d32f2f',
              },
            }}
            href={ROUTES.SERVICES}
          >
            Go to Services
          </Button>
        </Paper>
      </Box>
    );
  }

  // Unknown status - allow access by default (fail open)
  return children;
};

export default KycRedirectRoute;
