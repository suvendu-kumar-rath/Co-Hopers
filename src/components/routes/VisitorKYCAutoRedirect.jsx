import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

/**
 * VisitorKYCAutoRedirect Component
 * 
 * Automatically redirects visitor users to KYC form if:
 * 1. User is authenticated
 * 2. User type is 'visitor'
 * 3. KYC status is 'not_submitted'
 * 
 * This runs after successful login to immediately guide visitors
 * to complete KYC verification before accessing other features.
 */
const VisitorKYCAutoRedirect = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    // Don't proceed while auth is loading
    if (loading) return;

    // Check if user is authenticated and is a visitor
    if (
      isAuthenticated &&
      user?.userType === 'visitor' &&
      user?.kycStatus === 'not_submitted'
    ) {
      console.log('[VisitorKYCAutoRedirect] Visitor detected with no KYC, redirecting to KYC form', {
        userId: user.id,
        userType: user.userType,
        kycStatus: user.kycStatus
      });

      // Redirect to KYC form with return path
      navigate(ROUTES.FORM, {
        replace: true,
        state: {
          source: 'auto_redirect_after_login',
          returnPath: ROUTES.SERVICES,
          message: 'As a visitor, please complete KYC verification to proceed with booking.',
        },
      });
    }
  }, [isAuthenticated, user?.userType, user?.kycStatus, loading, navigate]);

  // Render children normally (won't show if redirect happens)
  return children;
};

export default VisitorKYCAutoRedirect;
