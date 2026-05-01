# Visitor KYC Auto-Redirect Implementation

## Overview

This document describes the **auto-redirect feature** that automatically routes visitor users to the KYC form immediately after successful login if their KYC status is `not_submitted`.

## What Changed

### New Component: VisitorKYCAutoRedirect
**File:** `src/components/routes/VisitorKYCAutoRedirect.jsx`

Automatically redirects visitor users to KYC form based on:
1. User is authenticated (`isAuthenticated === true`)
2. User type is visitor (`user.userType === 'visitor'`)
3. KYC status is not submitted (`user.kycStatus === 'not_submitted'`)

### Updated Files

| File | Changes |
|------|---------|
| `src/App.js` | Added VisitorKYCAutoRedirect wrapper |
| `src/components/routes/KycRedirectRoute.jsx` | Enhanced visitor detection logic |
| `src/components/forms/KYCForm.jsx` | Added useLocation import (was already done) |

## Auto-Redirect Flow

```
User Logs In (Email + Password)
         ↓
API Returns User Profile:
- userType: "visitor"
- kycStatus: "not_submitted"
         ↓
AuthContext.login() called
         ↓
VisitorKYCAutoRedirect detects visitor
with not_submitted KYC
         ↓
Auto-Redirect to /form
         ↓
User sees KYC Form with message:
"As a visitor, please complete KYC
verification to proceed with booking."
         ↓
User fills & submits KYC
         ↓
Successful submission
         ↓
User is shown success message
(with updated kycStatus tracking)
```

## How It Works

### Step 1: User Logs In
```javascript
// LoginModal calls authService.login()
const result = await authService.login(mobileNumber, password);

// Response includes:
{
  success: true,
  data: {
    id: 117,
    userType: "visitor",
    kycStatus: "not_submitted",
    name: "Suvendu",
    email: "...",
    mobile: "..."
  },
  token: "..."
}
```

### Step 2: AuthContext Stores User
```javascript
// LoginModal calls login() from AuthContext
login(result.data, result.token);

// This triggers setUser() which updates the component state
setUser(userData); // userData includes userType and kycStatus
```

### Step 3: VisitorKYCAutoRedirect Detects & Redirects
```javascript
// VisitorKYCAutoRedirect useEffect watches user changes
useEffect(() => {
  if (
    isAuthenticated &&
    user?.userType === 'visitor' &&
    user?.kycStatus === 'not_submitted'
  ) {
    // Auto-redirect to KYC form
    navigate(ROUTES.FORM, { replace: true, state: {...} });
  }
}, [isAuthenticated, user?.userType, user?.kycStatus, loading, navigate]);
```

### Step 4: User Completes KYC
```javascript
// After successful KYC submission in KYCForm
// If coming from auto-redirect, returnPath is set in location.state
const returnPath = location.state?.returnPath; // ROUTES.SERVICES

if (returnPath && returnPath !== ROUTES.FORM) {
  navigate(returnPath, {
    state: {
      kycSubmitted: true,
      returnedFromKYC: true
    }
  });
}
```

## Visitor Detection Logic (Enhanced)

The component now checks for visitor status in multiple ways:

```javascript
const isVisitorFromEligibleEntry = () => {
  // 1. Backend userType field is 'visitor'
  if (user?.userType === 'visitor') return true;
  
  // 2. User has explicit visitor flag
  if (user?.isVisitor === true) return true;
  
  // 3. User has visitor source (cafeteria/utilities)
  if (user?.source === 'visitor' || 
      user?.source === 'cafeteria' || 
      user?.source === 'utilities') {
    return true;
  }
  
  // 4. Navigation state indicates visitor
  if (location.state?.source === 'cafeteria' || 
      location.state?.source === 'utilities' ||
      location.state?.source === 'visitor') {
    return true;
  }
  
  return false;
};
```

## API Response Structure Expected

```json
{
  "success": true,
  "message": "Visitor profile fetched successfully",
  "data": {
    "id": 117,
    "name": "Suvendu",
    "email": "suvendukumar20@gmail.com",
    "mobile": "7008009000",
    "userType": "visitor",
    "kycStatus": "not_submitted",
    "kycDetails": null,
    "idProof": "http://...",
    "cabinNumber": "c-4",
    "roomNumber": "630"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## User Flows Comparison

### Visitor Flow (Auto-Redirect)
```
Login
  ↓
Auto-detect visitor + no KYC
  ↓
Immediate redirect to /form
  ↓
Fill KYC form
  ↓
Submit
  ↓
Success message
  ↓
Redirect to /services
```

### Regular User Flow (No Auto-Redirect)
```
Login
  ↓
Not a visitor (or KYC already submitted)
  ↓
Normal navigation continues
  ↓
User can access services/booking normally
```

### KYC Already Submitted
```
Visitor logs in
  ↓
Backend returns kycStatus: "PENDING" or "APPROVED"
  ↓
Auto-redirect condition NOT met
  ↓
Normal flow continues
```

## Browser Console Logs

When auto-redirect is triggered, you'll see:

```javascript
[VisitorKYCAutoRedirect] Visitor detected with no KYC, redirecting to KYC form {
  userId: 117,
  userType: 'visitor',
  kycStatus: 'not_submitted'
}
```

## Testing Scenarios

### Scenario 1: Visitor - Auto-Redirect
**Conditions:**
- User logs in with mobile number
- API returns `userType: 'visitor'` and `kycStatus: 'not_submitted'`

**Expected Behavior:**
1. ✅ Successful login
2. ✅ User data stored in AuthContext
3. ✅ Auto-redirect to `/form` triggered
4. ✅ KYC form displayed with message

**Verify In Browser:**
```javascript
// Check console for redirect log
// Check URL changed to /form
// Check for KYC form on page
```

### Scenario 2: Visitor - KYC Already Pending
**Conditions:**
- User logs in with mobile number
- API returns `userType: 'visitor'` and `kycStatus: 'PENDING'`

**Expected Behavior:**
1. ✅ Successful login
2. ✅ User data stored in AuthContext
3. ✅ NO auto-redirect (condition not met)
4. ✅ Normal navigation continues

### Scenario 3: Regular User - No Auto-Redirect
**Conditions:**
- User logs in with mobile number
- API returns `userType: null` or `'regular'` or doesn't match 'visitor'

**Expected Behavior:**
1. ✅ Successful login
2. ✅ User data stored in AuthContext
3. ✅ NO auto-redirect
4. ✅ Normal services page shown

## Implementation Checklist

- [x] Create VisitorKYCAutoRedirect component
- [x] Update App.js to wrap with VisitorKYCAutoRedirect
- [x] Enhance visitor detection in KycRedirectRoute
- [x] Add useLocation to KYCForm
- [x] Verify handleSubmit uses return path
- [x] Test auto-redirect behavior
- [x] Create documentation

## Code Examples

### Using Auto-Redirect in a Page Component
```javascript
import { useAuth } from '../context/AuthContext';
import VisitorKYCAutoRedirect from '../components/routes/VisitorKYCAutoRedirect';

function MyPage() {
  const { user, isAuthenticated } = useAuth();
  
  // Check if visitor
  if (user?.userType === 'visitor' && user?.kycStatus === 'not_submitted') {
    return <div>Redirecting to KYC...</div>;
    // VisitorKYCAutoRedirect will handle the actual redirect
  }
  
  return <div>Main content</div>;
}
```

### Checking KYC Status in Header/Navigation
```javascript
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user } = useAuth();
  
  if (user?.userType === 'visitor' && user?.kycStatus === 'not_submitted') {
    return <div>Please complete KYC to proceed</div>;
  }
  
  return <div>Welcome {user?.name}</div>;
}
```

## Troubleshooting

### Issue: Auto-redirect not working
**Check:**
1. Browser console for errors
2. User object has `userType` field set to 'visitor'
3. User object has `kycStatus` field set to 'not_submitted'
4. AuthContext.loading is false when redirect should occur
5. VisitorKYCAutoRedirect component is in the render tree

### Issue: User stuck in loop
**Check:**
1. KYC form submission is working (check API response)
2. After submission, kycStatus is being updated
3. useEffect dependencies are correct

### Issue: Some visitors not being redirected
**Check:**
1. Backend API is returning correct userType value
2. Visitor detection logic covers the specific user type
3. Authentication is successful before redirect

## Performance Considerations

- **No extra API calls:** Uses data already fetched during login
- **Instant redirect:** Happens in useEffect before component renders
- **Minimal overhead:** Simple condition checks
- **No caching issues:** Checks fresh user data from context

## Security Notes

- Redirect happens only after authentication confirmed
- Uses replace mode to prevent back-button to login
- Sensitive data (token) not exposed in URL
- KYC form requires same authentication to submit

## Future Enhancements

1. **Progressive Redirect:** Show progress bar during redirect
2. **Delayed Redirect:** Add slight delay for better UX
3. **Skip Option:** Allow visitors to skip KYC (if business rules allow)
4. **Notification:** Show toast/snackbar before redirecting
5. **Analytics:** Track auto-redirect events for analytics
6. **A/B Testing:** Test different redirect behaviors
