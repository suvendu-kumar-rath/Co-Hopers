# Visitor KYC Workflow Implementation Guide

## Overview
This document describes the implemented KYC (Know Your Customer) verification workflow for visitors accessing the meeting room booking page. This workflow is specifically designed for visitors registering from **cafeteria** or **utilities** entry points, and does NOT apply to users registering from the **services** or **meeting room** pages.

## Workflow Architecture

```
Visitor Logs In & Visits /book-meeting
          ↓
KycRedirectRoute Checks KYC Status
          ↓
    ┌─────────────┬──────────────┬──────────────┐
    ↓             ↓              ↓              ↓
NOT_SUBMITTED   PENDING     APPROVED/VERIFIED  REJECTED
    ↓             ↓              ↓              ↓
REDIRECT TO    SHOW           ALLOW        SHOW ERROR
KYC FORM      "AWAITING"      ACCESS       MESSAGE
    ↓         APPROVAL         ↓
FILL & SUBMIT   MSG         BOOK ROOM
    ↓             ↓
  SUCCESS     (blocked until
  MESSAGE     approved)
    ↓
REDIRECT BACK
TO BOOKING
```

## Routes

### `/meeting-room`
- **Purpose:** Direct meeting room booking without KYC verification
- **Users:** Registered users from services page
- **KYC Check:** None
- **Protection:** None

### `/book-meeting`
- **Purpose:** KYC-protected meeting room booking for visitors
- **Users:** Visitors from cafeteria or utilities entry points
- **KYC Check:** Yes (via KycRedirectRoute)
- **Protection:** Protected by KycRedirectRoute component

### `/form`
- **Purpose:** KYC form submission
- **Entry Point:** Automatic redirect from `/book-meeting` when KYC is NOT_SUBMITTED
- **Return Path:** Automatically redirects back to `/book-meeting` after successful submission

## Components

### KycRedirectRoute.jsx (`src/components/routes/KycRedirectRoute.jsx`)

A route protection component that manages the KYC verification workflow.

**Responsibilities:**
1. Check user authentication status
2. Verify visitor entry point (cafeteria/utilities)
3. Fetch KYC status from API
4. Route based on KYC status
5. Display appropriate UI messages

**KYC Status Handling:**

| Status | Action | UI |
|--------|--------|-----|
| `NOT_SUBMITTED` | Redirect to `/form` | Automatic redirect |
| `PENDING` | Block access, show message | Awaiting approval modal |
| `APPROVED` / `VERIFIED` | Allow access | Pass through to booking page |
| `REJECTED` | Block access, show error | Error modal with support contact |
| `ELIGIBLE_NO_CHECK` | Allow access | Pass through (non-visitor users) |

**API Integration:**
```javascript
// Fetches KYC status
const response = await kycService.getKYCStatus(user.id);
```

**Visitor Detection Logic:**
```javascript
// Checks if user is a visitor from eligible entry points
const isVisitorFromEligibleEntry = () => {
  const hasVisitorFlag = user?.isVisitor || user?.source === 'visitor';
  const hasEligibleEntry = 
    location.state?.source === 'cafeteria' || 
    location.state?.source === 'utilities' ||
    user?.source === 'cafeteria' ||
    user?.source === 'utilities';
  
  return hasVisitorFlag || hasEligibleEntry;
};
```

### KYCForm.jsx (`src/components/forms/KYCForm.jsx`)

Updated to support return path redirection.

**New Features:**
- Detects `returnPath` from location state
- Redirects to return path after successful submission (instead of pending review)
- Maintains KYC data consistency across submission flow

**Updated handleSubmit Logic:**
```javascript
const returnPath = location.state?.returnPath;

if (returnPath && returnPath !== ROUTES.FORM) {
  // Redirect back to booking if coming from KycRedirectRoute
  navigate(returnPath, {
    state: {
      kycId: kycOnlyResult.data?.kycId,
      kycSubmitted: true,
      returnedFromKYC: true
    }
  });
} else {
  // Default: go to pending review
  navigate(ROUTES.PENDING_REVIEW, {...});
}
```

### BookMeetingRoom.jsx (`src/pages/BookMeetingRoom.jsx`)

No changes required. Works seamlessly with both protected and unprotected routes.

## Usage

### For Developers

#### Sending a Visitor to KYC-Protected Booking:

```javascript
// Option 1: Direct navigation with entry point
navigate('/book-meeting', {
  state: {
    source: 'cafeteria' // or 'utilities'
  }
});

// Option 2: Link/Button
<Link to="/book-meeting" state={{ source: 'cafeteria' }}>
  Book Meeting Room
</Link>
```

#### Checking User's KYC Status:

```javascript
import { kycService } from '../services/kycService';

const response = await kycService.getKYCStatus(userId);
console.log(response.data.status); // e.g., 'PENDING', 'APPROVED', etc.
```

#### Adding Visitor Flag to User Profile:

```javascript
// Store during login
const userData = {
  ...loginResponse,
  source: 'cafeteria', // or 'utilities'
  isVisitor: true
};

// Or store in localStorage
localStorage.setItem('userSource', 'cafeteria');
```

### For End Users

#### Visitor Flow (from Cafeteria/Utilities):

1. **Login** → Redirected to entry point
2. **Click "Book Meeting Room"** → Navigates to `/book-meeting`
3. **KycRedirectRoute Checks Status:**
   - If KYC not submitted → Redirected to KYC form
   - If KYC pending → Shown "Awaiting Approval" message
   - If KYC approved → Allowed to proceed with booking
   - If KYC rejected → Shown error message
4. **If KYC Required:**
   - Fill KYC form (company or freelancer)
   - Submit required documents
   - See success message
   - Automatically redirected back to booking page
5. **If KYC Approved:**
   - Proceed with room selection
   - Select date and time
   - Complete booking

#### Regular User Flow (from Services):

1. **Login** → Directed to services page
2. **Browse and select meeting room** → Direct booking without KYC
3. **Complete booking process** → No KYC interruption

## API Endpoints

### Get KYC Status
```
GET /booking/kyc/{userId}/status
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "status": "PENDING|APPROVED|VERIFIED|REJECTED|NOT_SUBMITTED",
    "kycId": "...",
    "submittedAt": "...",
    "approvedAt": "..."
  }
}
```

### Submit KYC
```
POST /kyc/submit
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
{
  "kycType": "company|freelancer",
  "companyData": {...},
  "freelancerData": {...},
  "uploadedFiles": {...}
}

Response:
{
  "success": true,
  "data": {
    "kycId": "...",
    "status": "PENDING"
  }
}
```

## State Flow Diagram

```
┌─────────────────────────────────────┐
│ User Authenticates & Logs In        │
└──────────────┬──────────────────────┘
               │
               ├─ From Services
               │  └─ Direct to /meeting-room (no KYC check)
               │
               └─ From Cafeteria/Utilities
                  └─ Direct to /book-meeting
                     │
                     └─ KycRedirectRoute triggers
                        │
                        ├─ NOT_SUBMITTED → /form → KYCForm
                        │                            │
                        │                            └─ Submit → /book-meeting
                        │
                        ├─ PENDING → Awaiting approval modal
                        │
                        ├─ APPROVED/VERIFIED → BookMeetingRoom
                        │
                        └─ REJECTED → Error modal
```

## File Changes Summary

### Created Files:
- `src/components/routes/KycRedirectRoute.jsx` - KYC verification route protection component

### Modified Files:
- `src/constants/routes.js` - Added `/book-meeting` route constant
- `src/App.js` - Added KycRedirectRoute wrapper for `/book-meeting`
- `src/components/forms/KYCForm.jsx` - Added return path handling in submission

## Security Considerations

1. **Authentication Check:** Component verifies user is authenticated before checking KYC status
2. **API Token:** All KYC status checks include auth token in headers
3. **Fail-Secure:** On API error, defaults to `NOT_SUBMITTED` (blocks access)
4. **Session Validation:** KYC status is checked fresh on each route access
5. **No Local Cache:** KYC status is always fetched from backend to ensure accuracy

## Testing Scenarios

### Scenario 1: Visitor - KYC Not Submitted
```javascript
// User profile
{ id: 1, name: 'John', source: 'cafeteria' }

// Expected flow
/book-meeting → KycRedirectRoute check → /form → KYCForm → Submit → /book-meeting
```

### Scenario 2: Visitor - KYC Pending
```javascript
// KYC Status
{ status: 'PENDING' }

// Expected flow
/book-meeting → KycRedirectRoute check → Awaiting approval modal
```

### Scenario 3: Visitor - KYC Approved
```javascript
// KYC Status
{ status: 'APPROVED' }

// Expected flow
/book-meeting → KycRedirectRoute check → BookMeetingRoom → Booking
```

### Scenario 4: Regular User - No KYC Check
```javascript
// User profile
{ id: 2, name: 'Jane', source: null }

// Expected flow
/services → Select meeting room → /meeting-room → Booking (no KYC)
```

## Error Handling

### Network Error During KYC Status Check
- **Behavior:** Defaults to `NOT_SUBMITTED`
- **User Impact:** Redirected to KYC form (fail-secure)
- **Console Log:** Detailed error logged for debugging

### User Not Authenticated
- **Behavior:** Redirected to services page
- **User Impact:** Prompted to login
- **Message:** None

### Invalid API Response
- **Behavior:** Treated as `NOT_SUBMITTED`
- **User Impact:** Redirected to KYC form
- **Console Log:** Warning about unexpected response structure

## Future Enhancements

1. **Caching:** Cache KYC status with TTL to reduce API calls
2. **Bulk Status Check:** Support checking multiple users' KYC status
3. **KYC Resubmission:** Allow users to resubmit rejected KYC
4. **Admin Dashboard:** View and manage visitor KYC submissions
5. **Email Notifications:** Send approval/rejection emails to visitors
6. **Webhook Integration:** Real-time KYC status updates from backend

## Support

For issues or questions about the KYC workflow:

1. Check browser console for detailed logs
2. Verify API endpoint connectivity
3. Confirm user is authenticated
4. Check KYC status in backend admin panel
5. Review API response structure
