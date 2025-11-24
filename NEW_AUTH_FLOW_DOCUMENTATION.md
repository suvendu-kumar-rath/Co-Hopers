# Meeting Room Booking - New Authentication Flow

## 🎯 Quick Summary
**Backend provides `memberType` AND `kycRequired` in login/register response!** 
- If `kycRequired: true` → Redirect to KYC form
- If `kycRequired: false` → Use memberType and continue booking
- Both Members and Non-Members need approved KYC to book meeting rooms
- Difference: Members have space bookings, Non-Members don't

## Updated Flow (November 10, 2025) - REVISED

### Overview
The booking system requires authentication AND approved KYC before proceeding with meeting room reservations. **Member type is provided directly by the backend** based on space bookings. Both Members and Non-Members need approved KYC to book meeting rooms.

### Key Points
- **Authentication required**: User must login/register
- **KYC required**: Both member types need approved KYC
- **Member type auto-detected**: Backend checks space bookings
  - Has space bookings = Member (discounted pricing)
  - No space bookings = Non-Member (regular pricing)

## Complete User Journey

### 1. **Landing Page**
- User visits the booking page
- Clicks "Book Now" button
- Opens booking modal

### 2. **Booking Type Selection**
- User selects booking type (Hourly / Whole Day)
- **Authentication Required**: Login modal automatically opens
- If not registered: User can register from the same modal

### 3. **Login/Registration**
- **New Users**: Must create an account
- **Existing Users**: Login with credentials
- Login modal allows both login and registration
- **KYC check performed by backend** - returns `kycRequired` flag

### 4. **Post-Login: KYC Check & Member Type**
After successful login, backend returns:

```json
{
  "user": {...},
  "token": "JWT_TOKEN",
  "memberType": "member",  // or "non-member"
  "kycRequired": false     // true if KYC not completed/approved
}
```

**Backend Logic:**
- Checks if user has completed and approved KYC
- If KYC not done: `kycRequired: true` → Redirect to KYC form
- If KYC approved: `kycRequired: false` → Check space bookings
  - **Has space bookings** → `memberType: "member"`
  - **No space bookings** → `memberType: "non-member"`

**Frontend Handling:**
```javascript
if (userData.kycRequired) {
  // Redirect to /form for KYC completion
  navigate('/form');
} else {
  // KYC approved, show member type and continue booking
  setMemberType(userData.memberType); // "member" or "non-member"
  // Proceed to time slot selection
}
```

**Display:**
- If KYC required: Redirect to KYC form
- If KYC approved: Show member type as read-only badge
  - Green badge for Members
  - Orange badge for Non-Members

### 5. **Continue Booking**
Once authenticated and KYC approved:
- Member type is displayed (auto-detected from backend)
- Pricing shown based on member type
- User proceeds to time slot selection
- Rest of the booking flow continues normally

## Simplified Flow Diagram

```
User Visits Page
    ↓
Click "Book Now"
    ↓
Select Booking Type (Hourly/Whole Day)
    ↓
[Not Authenticated] → Login/Register Modal
    ↓
Login/Register Success
    ↓
Backend Returns: User Data + kycRequired + memberType
    ↓
┌─────────────────────────────┐
│                             │
kycRequired: true    kycRequired: false
│                             │
Redirect to          Check memberType
KYC Form (/form)              │
                    ┌─────────┴─────────┐
                    │                   │
                "member"          "non-member"
                    │                   │
              Has Space          No Space
              Bookings           Bookings
                    │                   │
                    └─────────┬─────────┘
                              ↓
                    Show Member Type Badge
                              ↓
                    Display Pricing Based on Type
                              ↓
                    Continue to Time Slot Selection
                              ↓
                    Complete Booking Flow
```

## API Endpoints Used

### 1. **Login/Register API** (Primary endpoint)
```
POST https://api.boldtribe.in/user/login
POST https://api.boldtribe.in/user/register

Response: {
  success: true,
  token: "JWT_TOKEN",
  data: {
    user: {...},
    memberType: "member" | "non-member",  // Provided by backend!
    kycRequired: true | false              // true if KYC not completed/approved
  }
}
```

**Backend Logic:**
- Checks KYC status first
- If KYC approved → Checks space bookings to determine memberType
  - Has space bookings = `"member"`
  - No space bookings = `"non-member"`
- Returns `kycRequired: true` if KYC not completed/approved
- Returns `kycRequired: false` if KYC is approved

**Frontend Handling:**
```javascript
if (userData.kycRequired) {
  // Redirect to /form for KYC
  navigate('/form');
} else {
  // Show member type and continue
  setMemberType(userData.memberType);
}
```

### 2. **Pricing Data**
```
GET https://api.boldtribe.in/api/meetingrooms/pricing
Params: memberType, bookingType, seatingCapacity
```

**No separate API call needed to check space bookings!** Member type comes directly from login/register response.

## State Management

### Key States
```javascript
const [bookingType, setBookingType] = useState('');
const [memberType, setMemberType] = useState(''); // From backend, not user-selectable
const [showLoginModal, setShowLoginModal] = useState(false);
const [loginModalAllowRegister, setLoginModalAllowRegister] = useState(true);
const [isCheckingUserStatus, setIsCheckingUserStatus] = useState(false);
const [userStatusMessage, setUserStatusMessage] = useState('');
```

### Flow Control Functions

#### `setUserMemberType(userData)`
- Called after successful login with userData from backend
- **First checks `kycRequired` flag:**
  - If `true`: Shows message and redirects to `/form` for KYC completion
  - If `false`: Proceeds with member type detection
- Extracts `memberType` from userData (backend provides: 'member' or 'non-member')
- Converts to display format ('Member' or 'Non-Member')
- Shows welcome message
- Proceeds to time slot selection after 1.5 seconds
- **No API calls needed** - uses data from login response

#### `handleBookingTypeChange(e)`
- Called when user selects booking type
- If not authenticated: Opens login modal
- If authenticated: Gets userData from sessionStorage and calls `setUserMemberType()`

#### `handleLoginSuccess(userData)`
- Called after successful login with complete userData from backend
- userData includes: user object, token, memberType, kycRequired
- Closes login modal
- Calls `setUserMemberType(userData)` to set member type from backend response

## UI Components

### 1. **Status Loading Display**
When checking user status:
```jsx
<Box> // Blue loading spinner
  <Typography>Checking your account status...</Typography>
</Box>
```

### 2. **Member Type Display (Read-Only)**
After verification:
```jsx
<Box> // Green for Member, Orange for Non-Member
  <Typography>Your Member Type</Typography>
  <Typography>{memberType}</Typography> // Auto-detected
  <CheckIcon />
</Box>
```

### 3. **Pricing Card**
Shows pricing based on auto-detected member type:
- Member prices (lower rates)
- Non-Member prices (standard rates)

## User Experience Flow Diagram

```
User Visits Page
    ↓
Click "Book Now"
    ↓
Select Booking Type (Hourly/Whole Day)
    ↓
[Not Authenticated] → Login/Register Modal
    ↓
Login/Register Success
    ↓
Check Space Bookings (NO KYC CHECK)
    ↓
┌─────────────┐
│             │
Has Bookings  No Bookings
│             │
Member        Non-Member
│             │
└──────┬──────┘
       ↓
Show Member Type (Auto-Detected)
       ↓
Display Pricing Based on Type
       ↓
Continue to Time Slot Selection
       ↓
Complete Booking Flow
```

## Benefits

### 1. **Simplicity**
- Backend handles all logic (KYC check + member type detection)
- Frontend just checks flags and redirects/displays accordingly
- Single authentication response contains all needed information

### 2. **Security & Compliance**
- KYC required for all meeting room bookings
- Ensures legitimate users and business compliance
- Admin approval process for KYC verification

### 3. **Automation**
- Member type auto-detected (no manual selection)
- Prevents user errors in member type selection
- Accurate pricing based on verified status

### 4. **User Experience**
- Clear KYC requirement upfront
- Fast redirect to KYC form if needed
- Seamless flow if KYC already approved
- Visual feedback with member type badge

### 5. **Data Integrity**
- Member type based on actual space bookings
- Cannot fake member status
- Consistent pricing across system

## User Type Breakdown

### Visual Hierarchy
```
┌─────────────────────────────────────────────────────────────┐
│                    ALL USERS (Registered)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
    KYC Required          KYC Approved
          │                       │
    Cannot Book           Can Book Meeting Rooms
    (Redirect to              │
     /form)          ┌────────┴────────┐
                     │                 │
              Has Space          No Space
              Bookings           Bookings
                     │                 │
                 MEMBER          NON-MEMBER
              (Discounted)      (Regular Price)
```

### Quick Reference Table

| User Type | KYC Status | Space Bookings | Can Book Meeting Rooms? | Pricing |
|-----------|------------|----------------|------------------------|---------|
| New User | Not Completed | N/A | ❌ No - Redirect to KYC | N/A |
| Member | ✅ Approved | ✅ Yes | ✅ Yes | 💰 Discounted |
| Non-Member | ✅ Approved | ❌ No | ✅ Yes | 💵 Regular |

**Key Insight:** Both Members and Non-Members can book meeting rooms, but they BOTH need approved KYC. The only difference is pricing based on whether they have space bookings.

---

## Implementation Summary

### What Changed (November 10, 2025)

1. ✅ **Corrected KYC Requirement Understanding**
   - KYC IS required for meeting room bookings
   - Both Members and Non-Members need approved KYC
   - Users without KYC are redirected to `/form`

2. ✅ **Member Type Clarification**
   - **Member** = Approved KYC + Has space bookings (discounted pricing)
   - **Non-Member** = Approved KYC + No space bookings (regular pricing)
   - Both can book meeting rooms (pricing is the only difference)

3. ✅ **Backend Integration**
   - Backend returns `kycRequired` flag in login response
   - Backend returns `memberType` based on space bookings
   - Frontend uses these values directly (no additional API calls)

4. ✅ **Frontend Logic**
   - Check `kycRequired` flag first
   - If `true`: Redirect to KYC form (`/form`)
   - If `false`: Show member type and continue booking
   - Display read-only member type badge

### Code Changes
- Updated `setUserMemberType()` function to check `kycRequired` flag
- Added redirect to `/form` when KYC is required
- Updated documentation to reflect correct KYC requirements
- Added user type breakdown and quick reference table

---

## Important Notes

### Backend Member Type Detection
✅ **Backend provides both `memberType` AND `kycRequired` in login/register response!**
- Backend checks KYC status and space bookings
- Returns `kycRequired: true/false` flag
- Returns `memberType: "member"/"non-member"` (if KYC approved)
- Frontend uses these values directly - no additional API calls needed

### KYC Requirement - CORRECTED
✅ **KYC IS REQUIRED for meeting room bookings!**
- **Both Members and Non-Members** need approved KYC to book meeting rooms
- Without approved KYC → User redirected to `/form` to complete KYC
- With approved KYC → User can proceed with booking

### Member Type Logic (Backend Determines)
**Both member types require approved KYC for meeting room bookings:**

- **"member"**: User with approved KYC + has space bookings → Discounted pricing
- **"non-member"**: User with approved KYC + NO space bookings → Regular pricing

**Key Points:**
- ✅ Both types need approved KYC to book meeting rooms
- ✅ Difference is only whether they have space bookings (affects pricing)
- ✅ Members get discounted pricing (because they also book spaces)
- ✅ Non-members pay regular pricing

### Data Flow
1. User logs in → Backend checks KYC status + space bookings
2. Backend returns: `{ user, token, memberType: "member"|"non-member", kycRequired: true|false }`
3. **If `kycRequired: true`** → Frontend redirects to `/form` for KYC completion
4. **If `kycRequired: false`** → Frontend shows memberType and continues booking
5. Frontend stores userData in sessionStorage via AuthContext
6. Frontend displays memberType as read-only badge (if KYC approved)
7. No additional API calls needed!

## Testing Scenarios

### Scenario 1: New User
1. Visit booking page
2. Select booking type
3. Register new account
4. Redirected to KYC form
5. Submit KYC
6. See "pending approval" message
7. Cannot proceed until approved

### Scenario 2: Existing User with Approved KYC + Space Booking
1. Visit booking page
2. Select booking type
3. Login
4. System checks: KYC approved + has space bookings
5. Auto-detected as "Member"
6. See member pricing
7. Continue booking

### Scenario 3: Existing User with Approved KYC + No Space Booking
1. Visit booking page
2. Select booking type
3. Login
4. System checks: KYC approved + no space bookings
5. Auto-detected as "Non-Member"
6. See non-member pricing
7. Continue booking

### Scenario 4: User with Pending KYC
1. Visit booking page
2. Select booking type
3. Login
4. System checks: KYC pending
5. See "waiting for approval" message
6. Cannot proceed with booking

## Code Changes Summary

### Modified Functions
- `handleBookingTypeChange()` - Now requires login after selection
- `handleLoginSuccess()` - Calls user status check
- Added `checkUserStatus()` - Verifies KYC status
- Added `checkMemberType()` - Auto-detects member type

### Modified States
- `loginModalAllowRegister` - Always true (allow registration)
- `memberType` - Read-only (auto-detected, not user-selectable)
- Added `kycStatus` - Tracks KYC verification status
- Added `isCheckingUserStatus` - Loading state
- Added `userStatusMessage` - Status feedback

### Modified UI
- Removed member type dropdown
- Added member type display badge (read-only)
- Added status checking loading indicator
- Added status message display

## Future Enhancements

1. **Email Notifications**
   - Notify user when KYC is approved/rejected
   - Reminder emails for pending KYC

2. **Real-time Status Updates**
   - WebSocket connection for instant KYC approval notification
   - No need to refresh/re-login

3. **Progressive KYC**
   - Allow basic booking without full KYC
   - Require KYC only for advanced features

4. **Member Benefits Display**
   - Show comparison table of Member vs Non-Member benefits
   - Encourage space booking for member status
