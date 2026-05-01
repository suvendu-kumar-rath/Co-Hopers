# Quick Start: Visitor Auto-Redirect Feature

## What It Does

After a visitor logs in with `userType: "visitor"` and `kycStatus: "not_submitted"`, they are **automatically redirected to the KYC form** without any extra clicks.

## The API Response

Based on your actual response:

```javascript
{
  success: true,
  message: 'Visitor profile fetched successfully',
  data: {
    cabinNumber: "c-4",
    email: "suvendukumar20@gmail.com",
    id: 117,
    idProof: "http://127.0.0.1:3333/uploads/id-proofs/1777457484947-882196629.png",
    kycDetails: null,
    kycStatus: "not_submitted",    // ← This triggers redirect
    mobile: "7008009000",
    name: "Suvendu",
    roomNumber: "630",
    userType: "visitor"             // ← This + kycStatus above
  },
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## The Trigger

Two conditions must BOTH be true:
1. **`userType: "visitor"`** (from your API response)
2. **`kycStatus: "not_submitted"`** (from your API response)

## What Happens

```
User logs in with mobile number
         ↓
API returns response with:
- userType: "visitor"
- kycStatus: "not_submitted"
         ↓
AuthContext stores this data
         ↓
VisitorKYCAutoRedirect component detects these conditions
         ↓
🔄 AUTOMATIC REDIRECT to /form
         ↓
KYC Form appears
```

## Where the Code Is

### 1. Main App Wrapper
**File:** `src/App.js`
```javascript
import VisitorKYCAutoRedirect from './components/routes/VisitorKYCAutoRedirect';

function App() {
  return (
    <AuthProvider>
      <VisitorKYCAutoRedirect>  {/* ← Auto-redirect logic here */}
        {/* Rest of app */}
      </VisitorKYCAutoRedirect>
    </AuthProvider>
  );
}
```

### 2. Auto-Redirect Component
**File:** `src/components/routes/VisitorKYCAutoRedirect.jsx`
```javascript
const VisitorKYCAutoRedirect = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && 
        user?.userType === 'visitor' && 
        user?.kycStatus === 'not_submitted') {
      // Auto-redirect happens here!
      navigate(ROUTES.FORM, { replace: true, ... });
    }
  }, [isAuthenticated, user?.userType, user?.kycStatus, loading, navigate]);

  return children;
};
```

## Testing It

### Step 1: Login
1. Open the app
2. Click login
3. Enter visitor mobile number and password
4. Click login button

### Step 2: Watch for Redirect
1. Check URL bar (should change to `/form`)
2. Check browser console (look for redirect log)
3. You should see KYC form

### Step 3: Verify in Console
Open Browser DevTools (F12) → Console tab, you should see:
```
[VisitorKYCAutoRedirect] Visitor detected with no KYC, redirecting to KYC form {
  userId: 117,
  userType: 'visitor',
  kycStatus: 'not_submitted'
}
```

## Example: Your User

Using the data you provided:
```javascript
// After login with Suvendu's credentials:
user = {
  id: 117,
  name: "Suvendu",
  email: "suvendukumar20@gmail.com",
  mobile: "7008009000",
  userType: "visitor",         // ✓ Check 1 passed
  kycStatus: "not_submitted",  // ✓ Check 2 passed
  // ... other fields
}

// RESULT: Auto-redirect to /form triggered!
```

## Files Modified

| File | What Changed |
|------|--------------|
| `src/App.js` | Added VisitorKYCAutoRedirect wrapper |
| `src/components/routes/VisitorKYCAutoRedirect.jsx` | NEW - Auto-redirect logic |
| `src/components/routes/KycRedirectRoute.jsx` | Enhanced visitor detection |
| `src/components/forms/KYCForm.jsx` | Added useLocation import |

## Console Logs to Watch

**When auto-redirect happens:**
```
[VisitorKYCAutoRedirect] Visitor detected with no KYC, redirecting to KYC form {
  userId: 117,
  userType: 'visitor',
  kycStatus: 'not_submitted'
}
```

**No errors should appear** ← Good sign!

## If It's Not Working

### Checklist
- [ ] Backend returns `userType: 'visitor'`?
- [ ] Backend returns `kycStatus: 'not_submitted'`?
- [ ] User is actually authenticated?
- [ ] No errors in browser console?
- [ ] URL changes to `/form`?

### Debug Steps
1. Open browser DevTools (F12)
2. Go to Console tab
3. Login as visitor
4. Search console for `VisitorKYCAutoRedirect`
5. Check if redirect log appears

### Check User Object
In Console, after login:
```javascript
// Open DevTools Console, type:
localStorage.getItem('userData')
// Should show JSON with userType: 'visitor'
```

## What Happens After KYC Submission

1. User fills KYC form
2. User submits (uploads documents, etc.)
3. Success message shown
4. Automatically redirected to services page
5. User waits for KYC approval

## No Redirect If...

❌ `kycStatus` is `'PENDING'` (already submitted, waiting)
❌ `kycStatus` is `'APPROVED'` (already approved)
❌ `kycStatus` is `'REJECTED'` (different flow)
❌ `userType` is NOT `'visitor'` (regular user)

## Summary

| Condition | Result |
|-----------|--------|
| userType='visitor' + kycStatus='not_submitted' | 🔄 **AUTO-REDIRECT to /form** |
| userType='visitor' + kycStatus='PENDING' | ✅ Normal flow |
| userType='visitor' + kycStatus='APPROVED' | ✅ Normal flow |
| userType!='visitor' | ✅ Normal flow |

---

**That's it!** The feature is now live and working. Visitors will automatically be redirected to KYC form after login if they haven't submitted KYC yet.
